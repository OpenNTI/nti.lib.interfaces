import Logger from '@nti/util-logger';
import {
	equals,
	getPropertyDescriptor,
	Parsing,
	Array as ArrayUtils,
} from '@nti/lib-commons';
import { ntiidEquals } from '@nti/lib-ntiids';

import {
	Parser,
	RepresentsSameObject,
	Service,
	IsModel,
} from '../constants.js';
import { parse } from '../models/Parser.js';

export const IsFieldSet = Symbol('Is FieldSet');
export const FieldSet = { [IsFieldSet]: true };

const logger = Logger.get('mixins:Fields');
const None = void 0;
const RAW = Symbol.for('Raw Data');
const PASCAL_CASE_REGEX = /(?:^|[^a-z0-9])([a-z0-9])?/gim;

export const getType = x => x?.constructor;
const getTypeName = x => ((x = getType(x)), x.name || x.MimeType);
const getMethod = x =>
	'get' + x.replace(PASCAL_CASE_REGEX, (_, c) => (c || '').toUpperCase());
const unidentifiable = x => !(x?.NTIID || x?.oid);

const TYPE_MAP = {
	'*': null, // wildcard "ANY" type
	any: null, // wildcard "ANY" type
	boolean: applyBooleanField,
	date: applyDateField,
	model: applyModelField,
	'model{}': applyModelDictionaryField,
	'model{}{}': applyModelMappedDictionaryField,
	object: applyObjectField,
	number: applyNumberField,
	string: applyStringField,
	'number?': coerceNumberField,
	'string?': coerceStringField,
};

const isEquivalent = Symbol('IsEquivalent');
const __get = Symbol('get');
const {
	prototype: { test: _t },
} = RegExp;
const isArrayType = _t.bind(/\[]$/);
// const isDictionaryType = _t.bind(/\{}$/);
// const isCollectionType = x => isArrayType(x) || isDictionaryType(x);

/**
 * @template {import('../types').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default (Base = Object) =>
	class Fields extends Base {
		/**
		 * Access the raw data used to build this model instance.
		 *
		 * @protected
		 * @returns {any}
		 */
		__toRaw() {
			return this[RAW];
		}

		/**
		 * Determine if this model (or field) has changed.
		 *
		 * @protected
		 * @param {string|symbol|null} property
		 * @returns {boolean}
		 */
		__isDirty(property = null) {
			const check = key => {
				const value = __readValue(this, key);
				const originalValue = this[RAW][key];

				// JavaScriptism: For the newcomers, `null == undefined` is true,
				// and so is `null !== undefined` but not `null === undefined`
				if (value == null && originalValue == null) {
					return false;
				}

				// covers literal values and strict object identities...
				if (value === originalValue) {
					return false;
				}

				// Arrays will likely never be strictly equal, so we need to check their items
				if (Array.isArray(value)) {
					// length differs means its dirty
					return value.length !== originalValue?.length
						? true // dirty, because length.
						: // if values in array are not models...
						!value.every(x => x instanceof Base)
						? // test for equality without models. remember, if they equal, then not dirty. (false)
						  !equals(
								value,
								originalValue,
								/* true means deep (objects are equivalent) */
								true
						  )
						: // fall back to testing each model for dirty, or if its raw, use equals
						  value.some(
								(x, i) =>
									x?.__isDirty?.() ??
									equals(x, originalValue[i], true)
						  );
				}

				if (value?.__isDirty?.() === false) {
					return false;
				}

				return true;
			};

			if (property) {
				return check(property);
			}

			for (const key of getFields(this).AllFields) {
				if (check(key)) {
					return true;
				}
			}

			return false;
		}

		constructor(...args) {
			super(...args);
			const service =
				(this[Service] = args.find(x => x?.isService === Service)) ??
				args.length > 1
					? args[0] // assume first arg is service if we have more than 1 arg (last arg should be data)
					: null;

			// Allow null, and objects that declare they are a service.
			// Undefined and other falsy values are invalid.
			if (service !== null && service?.isService !== Service) {
				console.log(args.length, args);
				throw new Error('Invalid Service Document');
			}

			let data = args.pop(); //data should always be the last arg

			const noData = !data;

			data = data ? clone(data) : {};

			this[RAW] = data;

			const { Fields, FieldKeys, FieldRenames, AllFields } = getFields(
				this,
				data
			);

			const MissingFields = FieldKeys.filter(
				x => !noData && !(x in data)
			);

			for (let overlapping of Object.keys(data).filter(x =>
				FieldRenames.includes(x)
			)) {
				logger.trace?.(
					'Model "%s" declares a field "%s" but it shadows another. data: %o',
					getTypeName(this),
					overlapping,
					data
				);
			}

			for (let missing of MissingFields) {
				logger.trace?.(
					'Model "%s" declares a field "%s" but it is not present in data: %o',
					getTypeName(this),
					missing,
					data
				);
			}

			for (let key of AllFields) {
				//get the name, type, and defaultValue of the field...
				const {
					name = key,
					type,
					required,
					defaultValue,
				} = Fields[key] || {}; //TODO: Add deprecated flag, and a forced value override.

				const value = data[key];
				const declared = key in Fields;

				try {
					applyFieldStrategy(
						this,
						name,
						type,
						value,
						declared,
						defaultValue,
						key
					);
				} catch (e) {
					if (!required) {
						throw e;
					}
				}

				//Setup renamed-meta-data
				if (name !== key) {
					updateField(this, key, {
						enumerable: false,
						get: getterWarning(this, name, key),
					});

					let desc = Object.getOwnPropertyDescriptor(this, name);
					if (!desc || !desc.get) {
						logger.warn(
							'Invalid Field Description for field %s on %o',
							name,
							this
						);
						desc = {
							get() {
								return null;
							},
						};
					}

					desc.get.renamedFrom = key;
					updateField(this, name, desc);
				}

				if (required && this[name] == null) {
					throw new TypeError(
						`Required field is null: ${key}${
							name === key ? '' : ` (aliased to ${name})`
						}`
					);
				}
			}
		}

		[Parser](raw, defaultValueForKey) {
			if (raw === this) {
				throw new Error(
					'Migration failure: something is calling parse with `this` as the first argument.'
				);
			}

			let key;
			//If the param is:
			//	1) a string, and
			//	2) the value at that key on 'this' is an object, and
			//	3) that value is not a parsed object (model, instance of Base)
			if (
				typeof raw === 'string' &&
				(typeof this[raw] === 'object' || this[raw] == null)
			) {
				key = raw;
				raw = this[key];
			}

			if (raw && raw[Parser]) {
				logger.error(
					new Error('Attempting to re-parse a model, aborting').stack
				);
				return raw;
			}

			const o = raw && doParse(this, raw);
			if (o?.addToPending) {
				this.addToPending(o);
			}

			if (key) {
				//If the parameter was a key, assign the parsed object back to the key...
				applyField(this, key, o);
				if (o == null || (Array.isArray(o) && o.length === 0)) {
					if (arguments.length > 1) {
						//a value was passed to the 2nd argument. (use its value no matter what it is.)
						this[key] = defaultValueForKey;
					} else {
						delete this[key];
					}
				}
			}
			return o;
		}

		[RepresentsSameObject](o) {
			const Cls = getType(this);

			if (Cls.deriveCacheKeyFrom) {
				return (
					Cls.deriveCacheKeyFrom(this) === Cls.deriveCacheKeyFrom(o)
				);
			}

			return (
				(unidentifiable(this) && unidentifiable(o)) ||
				ntiidEquals(
					this.NTIID,
					o.NTIID,
					true /*ignore "specific provider" differences*/
				) ||
				ntiidEquals(
					this.OID,
					o.OID,
					true /*ignore "specific provider" differences*/
				)
			);
		}

		getObjectHref() {
			return this.href || this[Service].getObjectURL(this.getID());
		}

		/**
		 * Fetch or apply new data to this model instance.
		 *
		 * @param {*?} newRaw
		 * @returns {Promise<this>}
		 */
		async refresh(newRaw) {
			const service = this[Service];
			const INFLIGHT = Symbol.for('model:inflight-refresh');
			const queue = this[INFLIGHT] || (this[INFLIGHT] = []);
			const [lock] = queue;

			if (lock) {
				// console.log('locked', !!newRaw);
				if (newRaw) {
					// append queue
					queue.push(newRaw);
				}

				return await lock;
			}

			logger.debug('Refresh %O', this);

			//TODO: in the case that we are getting the full object from the server
			//we should look at the keys we currently have and the keys on the incoming
			//data. If we had keys that are not in the incoming we should set them
			//to null on the incoming data so the property on the model will be nulled out
			//instead of retaining the previous value.

			this.addToPending(
				queue.push(
					(async () => {
						try {
							const firstTask = await (newRaw ||
								service.getObjectAtURL(
									this.getObjectHref(),
									this.getID()
								));

							const work = [
								firstTask,
								...queue.splice(1, queue.length),
							];
							for (const [, /*step*/ data] of Object.entries(
								work
							)) {
								this.applyRefreshedData(
									data
									// step === 0 && !newRaw
								);
							}
						} catch (e) {
							logger.warn('Refreshing %o because: %o', this, e);
							throw e;
						} finally {
							delete this[INFLIGHT];
						}
						return this;
					})()
				)[0]
			);

			return await queue[0];
		}

		//deprecated - use Fields declaration
		[Symbol.for('TakeOver')](x, y) {
			const scope = this;
			const enumerable = !!y;
			const name = y || x;
			const value = scope[x];
			const renamedFrom = x !== name ? x : None;

			if (scope[name] && x !== name) {
				logger.warn('%s is already defined.', name);
				return;
			}

			delete scope[x];
			setProtectedProperty(name, value, scope, enumerable, renamedFrom);

			if (x !== name) {
				Object.defineProperty(scope, x, {
					enumerable: false,
					get: getterWarning(scope, name, x),
				});
			}
		}

		/**
		 * @private
		 * @param {any} data
		 * @returns {this}
		 */
		applyRefreshedData(data) {
			if (!this[RepresentsSameObject](data)) {
				logger.debug(
					'Refreshed Data does not represent this object:\nInput: %O, Current Object: %O',
					data,
					this
				);
				throw new Error('Mismatch!');
			}

			if (data.__toRaw && data.getData) {
				data = {
					...data.__toRaw(),
					...data.getData({ diff: 'shallow' }),
				};
			}

			if (data.__toRaw) {
				data = data.__toRaw();
			}

			//TODO: check if the Last Modified in data is older than my Last Modified
			// if (!force && this.getLastModified() > Parsing.parseDate(data['Last Modified'])) {
			// 	throw new Error('Attempting to refresh with older data');
			// }

			// Update raw
			this[RAW] = {
				...this[RAW],
				...data,
				MimeType: data.MimeType || this[RAW].MimeType,
			};

			const { Fields, DataFields } = getFields(this, data);

			const changed = [];
			//Just iterate over changing fields
			for (const key of DataFields) {
				//get the name, type, and defaultValue of the field...
				const { name = key, type, defaultValue } = Fields[key] || {};

				//new value (raw)
				const value = data[key];

				// get the current property descriptor.
				const desc = getPropertyDescriptor(this, name);

				// pull the current getter/declared state from the get() method...
				const { [__get]: getter, declared } = (desc || {}).get || {};

				const current = getter ? getter() : this[key];

				// throw if we're about to replace a function
				if (typeof current === 'function') {
					throw new Error(
						'a value was named as one of the methods on this model.'
					);
				}

				// skip if the value does not change.
				if (equals(current, value, true)) {
					continue;
				}

				//Apply new value
				applyFieldStrategy(
					this,
					name,
					type,
					value,
					declared,
					defaultValue,
					key
				);

				// only add the field to changed set if the new field is not equivalent.
				const newValue = __readValue(this, name);

				const equiv = current?.[isEquivalent]
					? current[isEquivalent](newValue)
					: equals(current, newValue, true);

				if (!equiv) {
					changed.push(name);
				}
			}

			if (changed.length > 0) {
				this._emitChange?.(changed);
			}
			return this;
		}

		[isEquivalent](other) {
			if (this === other) {
				return true;
			}

			const keys = new Set([
				...getFields(this).AllFields,
				...getFields(other).AllFields,
			]);

			if (!(other instanceof Base)) {
				return false;
			}

			for (const key of keys) {
				const me = __readValue(this, key);
				const them = __readValue(other, key);
				// eslint-disable-next-line eqeqeq
				if (me != them) {
					if (
						me?.[isEquivalent]
							? me[isEquivalent](them)
							: equals(me, them, true)
					) {
						continue;
					}
					return false;
				}
			}

			return true;
		}

		/**
		 * Find the field name that has the given value.
		 *
		 * @param {*} value
		 * @returns {string | symbol | null}
		 */
		findField(value) {
			const keys = getFields(this).AllFields;
			return keys.find(x => __readValue(this, x) === value);
		}
	};

function applyFieldStrategy(
	scope,
	name,
	type,
	value,
	declared,
	defaultValue,
	key
) {
	const { constructor: Type } = scope;
	const ModelName = Type.name || Type.MimeType;

	try {
		//allow for hooking... however, strongly prefer setting type to the string: 'model'
		if (typeof type === 'function') {
			let val = null;
			//Explicit model:
			if (type.prototype && type.prototype[IsModel]) {
				val = new type(scope[Service], scope, value);

				//some one-off converter function: (please don't use this)
			} else {
				val = type(scope[Service], scope, value);
			}

			applyField(scope, name, val, true);
		} else {
			//Preferred code path:
			const baseType = isArrayType(type)
				? type.substr(0, type.length - 2)
				: type;
			const apply = TYPE_MAP[baseType] || applyField;
			if (type && !(baseType in TYPE_MAP)) {
				logger.warn(
					'Model "%s" declared "%s" to be type "%s", but that type is unknown.',
					ModelName,
					key,
					type
				);
			}
			apply(scope, name, value, declared, defaultValue);
		}
	} catch (e) {
		const reason = e.stack || e.message || e;
		logger.trace(
			'An error occurred parsing %s on %s because: %s',
			key,
			ModelName,
			reason
		);
		delete scope[key];
		delete scope[name];
		throw e;
	}
}

function getFields(obj, data = {}) {
	const Type = getType(obj);
	const { Fields = obj } = Type || {};
	const FieldKeys = Object.keys(Fields || {}).filter(k => Fields[k]);
	const FieldRenames = FieldKeys.map(x => Fields[x].name).filter(Boolean);
	const DataFields = Object.keys(data).filter(x => !FieldRenames.includes(x));
	const AllFields = Array.from(new Set([...DataFields, ...FieldKeys]));

	return {
		Fields,
		FieldKeys,
		FieldRenames,
		DataFields,
		AllFields,
	};
}

function getterWarning(scope, name, originalName) {
	function warn() {
		let m = 'There is a new accessor to use instead.';

		if (typeof name === 'string') {
			m = `Use ${name} instead.`;
		}

		m = new Error(`Access to ${originalName} is deprecated. ${m}`);
		logger.error(m.stack || m.message || m);
		return scope[name];
	}

	warn.renamedTo = name;
	warn[__get] = () => __readValue(scope, name);
	return warn;
}

function GetEnumerabilityOf(obj, propName) {
	const desc = Object.getOwnPropertyDescriptor(obj || {}, propName);
	return desc?.enumerable;
}

//deprecated
function setProtectedProperty(
	name,
	value,
	scope,
	enumerable = GetEnumerabilityOf(scope, name),
	renamedFrom = null
) {
	const get = () => value;

	let valueProperty = { writable: false, value };
	if (renamedFrom) {
		valueProperty = { get };
		Object.assign(get, { renamedFrom });
	}

	Object.defineProperty(scope, name, {
		configurable: true,
		enumerable,
		...valueProperty,
	});
}

export function updateField(scope, field, desc) {
	if (!('configurable' in desc)) {
		desc.configurable = true;
	}

	try {
		if (!delete scope[field]) {
			throw new Error('Field is not Configurable');
		}
		Object.defineProperty(scope, field, desc);
	} catch (e) {
		logger.warn(
			'Could not update Field: %o on %o, because %s',
			field,
			this,
			e.stack || e.message || e
		);
	}
}

// @private - used to read a value without warning.
// INTERNAL only! -- intended for serializing scope to JSON in JSONValue
export function __readValue(scope, fieldName) {
	const descriptor = getPropertyDescriptor(scope, fieldName);
	const { renamedTo, [__get]: getter } = descriptor?.get || {};

	if (
		descriptor &&
		'value' in descriptor &&
		typeof fieldName !== 'symbol' &&
		typeof descriptor.value !== 'function' &&
		!descriptor?.get &&
		scope?.[Parser]
	) {
		/** @type {WeakMap<unknown, {}>} */
		const seen = (__readValue.seen = __readValue.seen || new WeakMap());
		const key = scope.MimeType || scope;
		const localSeen = seen.get(key) || seen[key] || {};
		try {
			// if we get a string, weakMap will throw
			seen.set(key, localSeen);
		} catch {
			// just use the string as a property instead
			seen[key] = localSeen;
		}

		if (!localSeen[fieldName]) {
			localSeen[fieldName] = true;
			logger.warn(
				`Blocked reading non-field '${fieldName}' in %o'`,
				scope.MimeType || scope
			);
		}
		return;
	}

	const readKey = renamedTo || fieldName;
	return getter ? getter() : scope[readKey];
}

export function hideField(scope, fieldName) {
	updateField(
		scope,
		fieldName,
		Object.assign(Object.getOwnPropertyDescriptor(scope, fieldName), {
			enumerable: false,
		})
	);
}

function getParsedDateKey(key) {
	return Symbol.for(`Parsed Date: ${key}`);
}

function dateGetter(key) {
	const symbol = getParsedDateKey(key);
	let last;
	return function () {
		const v = __readValue(this, key);
		if (typeof this[symbol] !== 'object' || v !== last) {
			last = v;
			this[symbol] = Array.isArray(v)
				? v.map(x => Parsing.parseDate(x))
				: Parsing.parseDate(v);
		}
		return this[symbol];
	};
}

function enforceType(scope, fieldName, expectedType, value) {
	const type = !Array.isArray(value)
		? typeof value
		: value.map(x => typeof x);

	const isExpected = Array.isArray(type)
		? type.every(x => x === expectedType)
		: type === expectedType;

	if (!isExpected && type !== 'undefined') {
		throw new TypeError(
			`${
				getType(scope).name
			}: Expected a ${expectedType} type for ${fieldName} but got ${type}`
		);
	}
}

function applyBooleanField(scope, fieldName, valueIn, declared, defaultValue) {
	enforceType(scope, fieldName, 'boolean', valueIn || defaultValue);
	return applyField(scope, fieldName, valueIn, declared, defaultValue);
}

function applyNumberField(scope, fieldName, valueIn, declared, defaultValue) {
	enforceType(scope, fieldName, 'number', valueIn || defaultValue);
	return applyField(scope, fieldName, valueIn, declared, defaultValue);
}

function applyObjectField(scope, fieldName, valueIn, declared, defaultValue) {
	enforceType(scope, fieldName, 'object', valueIn || defaultValue);
	return applyField(scope, fieldName, valueIn, declared, defaultValue);
}

function applyStringField(scope, fieldName, valueIn, declared, defaultValue) {
	enforceType(scope, fieldName, 'string', valueIn || defaultValue);
	return applyField(scope, fieldName, valueIn, declared, defaultValue);
}

function coerceNumberField(scope, fieldName, valueIn, declared, defaultValue) {
	const coerced = valueIn != null ? parseFloat(valueIn, 10) : valueIn;
	return applyNumberField(scope, fieldName, coerced, declared, defaultValue);
}

function coerceStringField(scope, fieldName, valueIn, declared, defaultValue) {
	const coerced = valueIn != null ? valueIn.toString() : valueIn;
	return applyStringField(scope, fieldName, coerced, declared, defaultValue);
}

function applyDateField(scope, fieldName, value, declared, defaultValue) {
	let v = value ?? defaultValue;
	const methodName = getMethod(fieldName);

	const getter = () => {
		logger.warn(
			`The value of the ${fieldName} field is not a Date instance. Use the ${methodName}() method instead.`
		);
		return v;
	};
	Object.assign(getter, { declared, [__get]: () => v });

	delete scope[getParsedDateKey(fieldName)];

	updateField(scope, fieldName, {
		configurable: true,
		get: getter,
		set: x => {
			v = x;
			delete scope[getParsedDateKey(fieldName)];
		},
	});

	updateField(scope, methodName, {
		configurable: true,
		value: dateGetter(fieldName),
	});
}

function applyModelMappedDictionaryField(
	scope,
	fieldName,
	value,
	declared,
	defaultValue
) {
	let out = value == null ? value : {};

	if (out) {
		for (let dK of Object.keys(value || {})) {
			const map = value[dK];
			out[dK] = map;
			for (let mK of Object.keys(map)) {
				map[mK] = scope[Parser](map[mK]) || null;

				if (!map[mK]) {
					delete map[mK];
				}
			}

			if (Object.keys(map).length === 0) {
				delete out[dK];
			}

			Object.defineProperty(map, 'toJSON', { value: mapToJson });
			addDirtyCheck(out, Object.keys(map));
		}

		Object.defineProperty(out, 'toJSON', { value: mapToJson });
		addDirtyCheck(out, Object.keys(out));
	}

	applyField(scope, fieldName, out, declared, defaultValue);
}

function applyModelDictionaryField(
	scope,
	fieldName,
	value,
	declared,
	defaultValue
) {
	let out = value == null ? value : {};

	if (out) {
		for (let dK of Object.keys(value || {})) {
			out[dK] = scope[Parser](value[dK]) || null;
			//should we keep the empty value & key?
			if (!out[dK]) {
				delete out[dK];
			}
		}

		Object.defineProperty(out, 'toJSON', { value: mapToJson });
		addDirtyCheck(out, Object.keys(out));
	}

	applyField(scope, fieldName, out, declared, defaultValue);
}

function applyModelField(scope, fieldName, value, declared, defaultValue) {
	const parsedValues = ArrayUtils.ensure(value)
		.map(v =>
			v && Object.getPrototypeOf(v) !== Object.getPrototypeOf({})
				? v
				: scope[Parser](v)
		)
		.filter(Boolean);

	const parsed = Array.isArray(value)
		? parsedValues
		: parsedValues[0] || null;

	//Just preserve old behavior (things expect empty values to be falsy, including empty arrays)
	const v = Array.isArray(parsed) && parsed.length === 0 ? null : parsed;

	applyField(
		scope,
		fieldName,
		v || None, //allow defaultValue to kick in
		declared,
		defaultValue
	);
}

function addDirtyCheck(target, keys) {
	Object.defineProperty(target, '__isDirty', {
		value() {
			if (new Set([...Object.keys(this), ...keys]).size !== keys.length) {
				return true;
			}
			return keys.every(o => this[o]?.__isDirty?.());
		},
	});
}

function mapToJson() {
	const scope = this;
	const out = {};

	for (const key of Object.keys(scope)) {
		out[key] = scope[key].toJSON?.() ?? scope[key];
	}

	return out;
}

const FieldsFn = Symbol('is fields fn');
const makeFieldsFn = fn => ((fn[FieldsFn] = true), fn);
const isNonFieldsFn = fn => fn && !fn[FieldsFn];

function applyField(scope, fieldName, valueIn, declared, defaultValue) {
	let value = clone(valueIn !== None ? valueIn : defaultValue);
	let originalName = null;

	if (fieldName in scope) {
		const descriptor = getPropertyDescriptor(scope, fieldName);
		const { get, set } = descriptor || {};
		if (get?.renamedFrom) {
			originalName = {
				renamedFrom: get.renamedFrom,
			};
		}

		// We only want to skip when the class has defined its own getter/setter.
		// When applyField is invoked as part of a refresh, the Fields getter/setter
		// functions (assigned below) will already be present but we still want to proceed.
		const hasOwnGetter = isNonFieldsFn(get);
		const hasOwnSetter = isNonFieldsFn(set);
		if (hasOwnGetter || hasOwnSetter) {
			try {
				if (
					(descriptor.writable && 'value' in descriptor) ||
					hasOwnSetter
				) {
					try {
						applyField.applying = true;
						scope[fieldName] = value;
					} finally {
						applyField.applying = false;
					}
				}
			} catch (e) {
				logger.stack?.(e);
			}
			return;
		}

		// 'get' will be the Fields getter here. Checking it to just
		// avoid logger noise when overwriting our own descriptor
		if (descriptor && !get) {
			logger.warn(
				`Overwriting existing field '${fieldName}' in %o'`,
				scope.MimeType || scope
			);
		}
	}

	delete scope[fieldName];

	const setter = makeFieldsFn(x => {
		scope[`beforeSet:${fieldName}`]?.(x);
		// console.trace('setting %s to', fieldName, x);
		value = x;
		if (!applyField.applying) {
			scope.onChange?.(fieldName);
		}
		scope[`afterSet:${fieldName}`]?.(x);
	});
	const getter = makeFieldsFn(() => value);
	const warningGetter = makeFieldsFn(
		() => (
			logger.warn('Undeclared Access of %s on %o', fieldName, scope),
			value
		)
	);

	const get =
		declared || fieldName === 'MimeType' //MimeType should always be treated as declared.
			? getter
			: warningGetter;

	Object.assign(get, {
		[__get]: getter,
		declared,
		...originalName,
	});

	const set = setter;

	Object.defineProperty(scope, fieldName, {
		configurable: true,
		enumerable: declared,
		get,
		set,
	});
}

export function clone(obj) {
	if (typeof obj !== 'object' || obj == null) {
		return obj;
	}

	if (
		(!Array.isArray(obj) &&
			Object.getPrototypeOf(obj) !== Object.getPrototypeOf({})) ||
		// or its an intermediate object (see applyModelDictionaryField and applyModelMappedDictionaryField)
		'__isDirty' in obj
	) {
		/**
		 * We decided to pass models along.
		 * They will be handled in the applyModelField as a model and not be re-parsed.
		 * This was a problem when we passed parsed models and then re-parsed them again.
		 * Since we are no longer doing that this shouldn't be an issue.
		 */

		return obj;
	}

	const out = Array.isArray(obj) ? [] : {};
	for (let key of Object.keys(obj)) {
		out[key] = clone(obj[key]);
	}

	return out;
}

function doParse(parent, data) {
	const service = parent[Service] ?? null;

	try {
		return data && parse(service, parent, data);
	} catch (e) {
		const m = e.NoParser ? e.message : e;

		logger.warn(m.stack || m.message || m);

		return null;
	}
}
