import Logger from '@nti/util-logger';
import {Parsing} from '@nti/lib-commons';
import {ntiidEquals} from '@nti/lib-ntiids';

import {Parser, RepresentsSameObject, Service, IsModel} from '../constants';
import {parse} from '../models/Parser';


const logger = Logger.get('mixins:Fields');
const None = void 0;
const RAW = Symbol.for('Raw Data');
const PASCAL_CASE_REGEX = /(?:^|[^a-z0-9])([a-z0-9])?/igm;

const getType = x => x.constructor;
const getTypeName = x => (x = getType(x), x.name || x.MimeType);
const getMethod = x => 'get' + x.replace(
	PASCAL_CASE_REGEX,
	(_, c) => (c || '').toUpperCase()
);

const SKIP_WARN = Symbol('Warning Skip');//only used to prevent internal references from triggering a warning.

const TYPE_MAP = {
	'*': null, // wildcard "ANY" type
	'any': null, // wildcard "ANY" type
	'boolean': applyBooleanField,
	'date': applyDateField,
	'model': applyModelField,
	'model{}': applyModelDictionaryField,
	'model{}{}': applyModelMappedDictionaryField,
	'object': applyObjectField,
	'number': applyNumberField,
	'string': applyStringField,
	'number?': coerceNumberField,
	'string?': coerceStringField
};

const isArrayType = RegExp.prototype.test.bind(/\[]$/);
// const isDictionaryType = RegExp.prototype.test.bind(/\{}$/);
// const isCollectionType = x => isArrayType(x) || isDictionaryType(x);

export default function FieldsApplyer (target) {

	initFields(target);

	return {

		__toRaw () {
			return this[RAW];
		},

		initMixin (data) {
			const noData = !data;

			data = data ? clone(data) : {};

			this[RAW] = data;

			const {
				Fields,
				FieldKeys,
				FieldRenames,
				AllFields
			} = getFields(this, data);

			const MissingFields = FieldKeys.filter(x => !noData && !(x in data));

			for(let overlaping of Object.keys(data).filter(x => FieldRenames.includes(x))) {
				logger.debug('Model "%s" declares a field "%s" but it shadows another. data: %o', getTypeName(this), overlaping, data);
			}

			for (let missing of MissingFields) {
				logger.debug('Model "%s" declares a field "%s" but it is not present in data: %o', getTypeName(this), missing, data);
			}

			for (let key of AllFields) {
				//get the name, type, and defaultValue of the field...
				const {name = key, type, required, defaultValue} = Fields[key] || {}; //TODO: Add deprecated flag, and a forced value override.

				const value = data[key];
				const declared = key in Fields;

				try {
					applyFieldStrategy(this, name, type, value, declared, defaultValue, key);
				} catch (e) {
					if (!required) {
						throw e;
					}
				}

				//Setup renamed-meta-data
				if (name !== key) {
					updateField(this, key, {
						enumerable: false,
						get: getterWarning(this, name, key)
					});

					let desc = Object.getOwnPropertyDescriptor(this, name);
					if (!desc || !desc.get) {
						logger.warn('Invalid Field Description for field %s on %o', name, this);
						desc = {
							get () { return null; }
						};
					}

					desc.get.renamedFrom = key;
					updateField(this, name, desc);
				}

				if (required && this[name] == null) {
					throw new TypeError(`Required field is null: ${key}${name === key ? '' : ` (aliased to ${name})`}`);
				}
			}
		},



		[Parser] (raw, defaultValueForKey) {

			if (raw === this) {
				throw new Error('Migration failure: something is calling parse with `this` as the first argument.');
			}


			let key;
			//If the param is:
			//	1) a string, and
			//	2) the value at that key on 'this' is an object, and
			//	3) that value is not a parsed object (model, instance of Base)
			if (typeof raw === 'string' && (typeof this[raw] === 'object' || this[raw] == null)) {
				key = raw;
				raw = this[key];
			}


			if (raw && raw[Parser]) {
				logger.error(new Error('Attempting to re-parse a model, aborting').stack);
				return raw;
			}


			const o = raw && doParse(this, raw);
			if (o && o.addToPending) {
				this.addToPending(o);
			}

			if (key) {//If the paramater was a key, assign the parsed object back to the key...
				applyField(this, key, o);
				if (o == null || (Array.isArray(o) && o.length === 0)) {
					if (arguments.length > 1) {//a value was passed to the 2nd argument. (use its value no matter what it is.)
						this[key] = defaultValueForKey;
					} else {
						delete this[key];
					}
				}
			}
			return o;
		},



		[RepresentsSameObject] (o) {
			return ntiidEquals(this.NTIID, o.NTIID, true/*ignore "specific provider" differences*/);
		},



		getObjectHref () {
			return this.href || this[Service].getObjectURL(this.getID());
		},



		refresh (newRaw) {
			const service = this[Service];
			const INFLIGHT = 'model:inflight-refresh';

			if (this[INFLIGHT]) {
				if (newRaw) {
					logger.debug('Waiting to refresh until previous refresh %o', this);
					return this[INFLIGHT].then(()=> this.refresh(newRaw));
				}

				logger.debug('Ignoring duplicate request to refresh. %o', this);
				return this[INFLIGHT];
			}
			logger.debug('Refresh %o', this);

			const fetch = newRaw
				? Promise.resolve(newRaw)
				: service.getObjectAtURL(this.getObjectHref(), this.getID());

			const inflight = fetch.then(o => this.applyRefreshedData(o));

			this[INFLIGHT] = inflight
				.catch((r) => (delete this[INFLIGHT], Promise.reject(r))) //swallow all errors so we can cleanup
				.then((r)  => (delete this[INFLIGHT], r));

			this.addToPending(inflight);

			return inflight;
		},



		//deprecated - use Fields declaration
		[Symbol.for('TakeOver')] (x, y) {
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
					get: getterWarning(scope, name, x)
				});
			}
		},



		applyRefreshedData (data) {
			if (!this[RepresentsSameObject](data)) {
				throw new Error('Mismatch!');
			}

			// Update raw
			this[RAW] = {...this[RAW], ...data};

			const {Fields, DataFields} = getFields(this, data);

			//Just iterate over changing fields
			for(let key of DataFields) {
				//get the name, type, and defaultValue of the field...
				const {name = key, type, defaultValue} = Fields[key] || {};

				//new value (raw)
				const value = data[key];

				// get the current property descriptor.
				const desc = Object.getOwnPropertyDescriptor(this, name);

				// pull the current getter/declared state from the get() method...
				const {getter, declared} = (desc || {}).get || {};

				// get the current value...
				this[SKIP_WARN] = true;
				const current = getter ? getter() : this[key];
				delete this[SKIP_WARN];

				// throw if we're about to replace a function
				if (typeof current === 'function') {
					throw new Error('a value was named as one of the methods on this model.');
				}

				// skip if the value does not change.
				if (current === value) {
					continue;
				}

				//Apply new value
				applyFieldStrategy(this, name, type, value, declared, defaultValue, key);
			}

			return this;
		}
	};
}


function initFields (target) {

	function validateFields (Fields, Class) {
		const fields = Object.keys(Fields);
		for (let field of fields) {
			const {name = field, type/*, required, defaultValue*/} = Fields[field] || {};
			let tKey = isArrayType(type) ? type.substr(0, type.length - 2) : type;
			if (typeof tKey === 'string' && !TYPE_MAP.hasOwnProperty(tKey)) {
				throw new TypeError(`${Class.name}: Invalid Field "${name}". The type "${type}" is not defined.`);
			}
		}
	}

	const slot = initFields.slot || (initFields.slot = Symbol.for('[[Fields]]'));

	target[slot] = target.Fields;
	validateFields(target.Fields, target);

	updateField(target, 'Fields', {
		enumerable: true,
		configurable: true,
		get () { return this[slot]; },
		set (newFields) {
			const current = this[slot];
			validateFields(this[slot] = {
				...current,
				...newFields
			}, this);
		}
	});
}



function applyFieldStrategy (scope, name, type, value, declared, defaultValue, key) {
	const {constructor: Type} = scope;
	const ModelName = Type.name || Type.MimeType;

	try {
		//allow for hooking... however, strongly prefer setting type to the string: 'model'
		if (typeof type === 'function') {
			let val = null;
			//Explicit model:
			if (type.prototype[IsModel]) {
				val = new type(scope[Service], scope, value);

			//some one-off converter function: (please don't use this)
			} else {
				val = type(scope[Service], scope, value);
			}

			applyField(scope, name, val, true);

		} else {

			//Preferred code path:
			const baseType = isArrayType(type) ? type.substr(0, type.length - 2) : type;
			const apply = TYPE_MAP[baseType] || applyField;
			if (type && !(baseType in TYPE_MAP)) {
				logger.warn('Model "%s" declared "%s" to be type "%s", but that type is unknown.', ModelName, key, type);
			}
			apply(scope, name, value, declared, defaultValue);
		}
	} catch (e) {
		const reason = e.stack || e.message || e;
		logger.error('An error occurred parsing %s on %s because: %s', key, ModelName, reason);
		delete scope[key];
		delete scope[name];
		throw e;
	}
}



function getFields (obj, data) {
	const Type = getType(obj);
	const {Fields} = Type;
	const FieldKeys = Object.keys(Fields).filter(k => Fields[k]);
	const FieldRenames = FieldKeys.map(x => Fields[x].name).filter(Boolean);
	const DataFields = Object.keys(data).filter(x => !FieldRenames.includes(x));
	const AllFields = Array.from(new Set([...DataFields, ...FieldKeys]));

	return {
		Fields,
		FieldKeys,
		FieldRenames,
		DataFields,
		AllFields
	};
}



function getterWarning (scope, name, originalName) {
	function warn () {
		let m = 'There is a new accessor to use instead.';

		if (typeof name === 'string') {
			m = `Use ${name} instead.`;
		}

		m = new Error(`Access to ${originalName} is deprecated. ${m}`);
		logger.error(m.stack || m.message || m);
		return scope[name];
	}

	warn.renamedTo = name;

	return warn;
}



function GenEnumerabilityOf (obj, propName) {
	const desc = obj && Object.getOwnPropertyDescriptor(obj, propName);
	return desc && desc.enumerable;
}


//deprecated
function setProtectedProperty (name, value, scope, enumerable = GenEnumerabilityOf(scope, name), renamedFrom = null) {
	const get = () => value;

	let valueProperty = {writable: false, value};
	if (renamedFrom) {
		valueProperty = {get};
		Object.assign(get, {renamedFrom});
	}

	Object.defineProperty(scope, name, {
		configurable: true,
		enumerable,
		...valueProperty
	});
}



export function updateField (scope, field, desc) {
	if (!('configurable' in desc)) {
		desc.configurable = true;
	}

	try {
		if (!(delete scope[field])) {
			throw new Error('Field is not Configurable');
		}
		Object.defineProperty(scope, field, desc);
	} catch(e) {
		logger.warn('Could not update Field: %o on %o, because %s', field, this, e.stack || e.message || e);
	}
}


// @private - used to read a value without warning.
// INTERNAL only! -- intended for serializing scope to JSON in JSONValue.js
export function readValueFor (scope, fieldName) {
	const descriptor = Object.getOwnPropertyDescriptor(scope, fieldName);
	const readKey = ((descriptor || {}).get || {}).renamedTo || fieldName;
	try {
		scope[SKIP_WARN] = true;
		return scope[readKey];
	} finally {
		delete scope[SKIP_WARN];
	}
}



export function hideField (scope, fieldName) {
	updateField(scope, fieldName, Object.assign(
		Object.getOwnPropertyDescriptor(scope, fieldName),
		{
			enumerable: false
		}
	));
}



function getParsedDateKey (key) {
	return Symbol.for(`Parsed Date: ${key}`);
}



function dateGetter (key) {
	const symbol = getParsedDateKey(key);
	let last;
	return function () {
		this[SKIP_WARN] = true;
		try {
			if (typeof this[symbol] !== 'object' || this[key] !== last) {
				last = this[key];
				this[symbol] = Array.isArray(last)
					? last.map(x => Parsing.parseDate(x))
					: Parsing.parseDate(last);
			}
			return this[symbol];
		} finally {
			delete this[SKIP_WARN];
		}
	};
}



function enforceType (scope, fieldName, expectedType, value) {
	const type = !Array.isArray(value) ? typeof value : value.map(x => typeof x);

	const isExpected = Array.isArray(type)
		? type.every(x => x === expectedType)
		: type === expectedType;

	if (!isExpected && type !== 'undefined') {
		throw new TypeError(`${scope.constructor.name}: Expected a ${expectedType} type for ${fieldName} but got ${type}`);
	}
}



function applyBooleanField (scope, fieldName, valueIn, declared, defaultValue) {
	enforceType(scope, fieldName, 'boolean', valueIn || defaultValue);
	return applyField(scope, fieldName, valueIn, declared, defaultValue);
}



function applyNumberField (scope, fieldName, valueIn, declared, defaultValue) {
	enforceType(scope, fieldName, 'number', valueIn || defaultValue);
	return applyField(scope, fieldName, valueIn, declared, defaultValue);
}



function applyObjectField (scope, fieldName, valueIn, declared, defaultValue) {
	enforceType(scope, fieldName, 'object', valueIn || defaultValue);
	return applyField(scope, fieldName, valueIn, declared, defaultValue);
}



function applyStringField (scope, fieldName, valueIn, declared, defaultValue) {
	enforceType(scope, fieldName, 'string', valueIn || defaultValue);
	return applyField(scope, fieldName, valueIn, declared, defaultValue);
}



function coerceNumberField (scope, fieldName, valueIn, declared, defaultValue) {
	const coerced = valueIn != null ? parseFloat(valueIn, 10) : valueIn;
	return applyNumberField(scope, fieldName, coerced, declared, defaultValue);
}



function coerceStringField (scope, fieldName, valueIn, declared, defaultValue) {
	const coerced = valueIn != null ? valueIn.toString() : valueIn;
	return applyStringField(scope, fieldName, coerced, declared, defaultValue);
}



function applyDateField (scope, fieldName, value) {
	let v = value;
	const methodName = getMethod(fieldName);

	const getter = ( ) => {
		if (!scope[SKIP_WARN]) {
			logger.warn(`The value of the ${fieldName} field is not a Date instance. Use the ${methodName}() method instead.`);
		}
		return v;
	};

	updateField(scope, fieldName, {
		configurable: true,
		get: getter,
		set: (x) => {
			v = x;
			delete scope[getParsedDateKey(fieldName)];
		}
	});

	updateField(scope, methodName, {
		configurable: true,
		value: dateGetter(fieldName)
	});
}



function applyModelMappedDictionaryField (scope, fieldName, value, declared, defaultValue) {
	let out = value == null ? value : {};

	if (out) {
		for (let dK of Object.keys(value || {})) {
			const map = value[dK];
			out[dK] = map;

			for (let mK of Object.keys(map)) {
				map[mK] = scope[Parser]( map[mK] ) || null;

				if (!map[mK]) {
					delete map[mK];
				}
			}

			if (Object.keys(map).length === 0) {
				delete out[dK];
			}
		}
	}

	applyField(
		scope,
		fieldName,
		out,
		declared,
		defaultValue
	);
}



function applyModelDictionaryField (scope, fieldName, value, declared, defaultValue) {
	let out = value == null ? value : {};

	if (out) {
		for (let dK of Object.keys(value || {})) {
			out[dK] = scope[Parser]( value[dK] ) || null;
			//should we keep the empty value & key?
			if (!out[dK]) {
				delete out[dK];
			}
		}
	}

	applyField(
		scope,
		fieldName,
		out,
		declared,
		defaultValue
	);
}



function applyModelField (scope, fieldName, value, declared, defaultValue) {
	const parsed = scope[Parser](value) || null;
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



function applyField (scope, fieldName, valueIn, declared, defaultValue) {
	let value = valueIn !== None ? valueIn : clone(defaultValue);

	delete scope[fieldName];

	const setter =  x => value = x;
	const getter = () => value;
	const warningGettter = () => (
		logger.warn('Undeclared Access of %s on %o', fieldName, scope.MimeType || scope),
		value
	);

	const get = declared
		? getter
		: warningGettter;

	Object.assign(get, { declared, getter });

	const set = setter;

	Object.defineProperty(scope, fieldName, {
		configurable: true,
		enumerable: declared,
		get,
		set
	});
}



function clone (obj) {
	if (typeof obj !== 'object' || obj == null) {
		return obj;
	}

	const out = Array.isArray(obj) ? [] : {};
	for(let key of Object.keys(obj)) {
		out[key] = clone(obj[key]);
	}

	return out;
}



function doParse (parent, data) {
	const service = parent[Service];

	try {
		return data && parse(service, parent, data);
	} catch (e) {
		const m = e.NoParser ? e.message : e;

		logger.warn(m.stack || m.message || m);

		return null;
	}
}
