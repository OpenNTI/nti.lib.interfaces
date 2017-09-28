import Logger from 'nti-util-logger';
import {Parsing} from 'nti-commons';
import {ntiidEquals} from 'nti-lib-ntiids';

import {DateFields, Parser, RepresentsSameObject, Service} from '../constants';
import {parse} from '../models/Parser';
import Base from '../models/Base';


const logger = Logger.get('mixins:Fields');
const None = void 0;
const RAW = Symbol('Raw Data');
const PASCAL_CASE_REGEX = /(?:^|[^a-z0-9])([a-z0-9])?/igm;

const getType = x => x.constructor;
const getTypeName = x => (x = getType(x), x.name || x.MimeType);
const getMethod = x => 'get' + x.replace(
	PASCAL_CASE_REGEX,
	(_, c) => (c || '').toUpperCase()
);

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
};

const isArrayType = RegExp.prototype.test.bind(/\[]$/);
// const isDictionaryType = RegExp.prototype.test.bind(/\{}$/);
// const isCollectionType = x => isArrayType(x) || isDictionaryType(x);

export default function FieldsApplyer (target) {

	initFields(target);

	return {

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
				const {name = key, type, required, defaultValue} = Fields[key] || {};

				const value = data[key];
				const declared = key in Fields;

				applyFieldStrategy(this, name, type, value, declared, defaultValue, key);

				//Setup renamed-meta-data
				if (name !== key) {
					updateField(this, key, {
						enumerable: false,
						get: getterWarning(this, name, key)
					});

					const desc = Object.getOwnPropertyDescriptor(this, name);
					if (!desc || !desc.get) {
						logger.warn('Invalid Field Description for field %s on %o', name, this);
					}

					desc.get.renamedFrom = key;
					updateField(this, name, desc);
				}

				if (required && this[name] == null) {
					throw new TypeError(`Required field is null: ${key}${name === key ? '' : ` (aliased to ${name})`}`);
				}
			}


			const legacyDateFields = this[DateFields] && (this[DateFields]() || []).filter(x => !Fields[x]);
			if (legacyDateFields.length > 0) {
				logger.warn('Declare your date fields instead of using [DateFields](): %o', this);
				for (let fieldName of new Set(this[DateFields]())) {
					applyDateField(this, fieldName, data[fieldName]);
				}
			}

		},



		//deprecated
		[DateFields] () { return []; },



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
				const current = getter ? getter() : this[key];

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

	const slot = initFields.slot || (initFields.slot = Symbol.for('[[Fields]]'));

	target[slot] = target.Fields;

	updateField(target, 'Fields', {
		enumerable: true,
		configurable: true,
		get () { return this[slot]; },
		set (newFields) {
			const current = this[slot];
			this[slot] = {
				...current,
				...newFields
			};
		}
	});
}



function applyFieldStrategy (scope, name, type, value, declared, defaultValue, key) {
	const {constructor: Type} = scope;

	//allow for hooking... however, strongly prefer setting type to the string: 'model'
	if (typeof type === 'function') {
		let val = null;
		//Explicit model:
		if (type.prototype instanceof Base) {
			val = new type(scope[Service], scope, value);

			//some one-off converter function: (please don't use this)
		} else {
			val = type(scope[Service], scope, value);
		}

		applyField(scope, name, val, true);


		//Preferred code path:
	} else {
		const baseType = isArrayType(type) ? type.substr(0, type.length - 2) : type;
		const apply = TYPE_MAP[baseType] || applyField;
		if (type && !(baseType in TYPE_MAP)) {
			logger.warn('Model "%s" declared "%s" to be type "%s", but that type is unknown.', Type.name || Type.MimeType, key, type);
		}
		apply(scope, name, value, declared, defaultValue);
	}
}



function getFields (obj, data) {
	const Type = getType(obj);
	const {Fields} = Type;
	const FieldKeys = Object.keys(Fields);
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
		if (typeof this[symbol] !== 'object' || this[key] !== last) {
			last = this[key];
			this[symbol] = Array.isArray(last)
				? last.map(x => Parsing.parseDate(x))
				: Parsing.parseDate(last);
		}
		return this[symbol];
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



function applyDateField (scope, fieldName, value) {
	let v = value;

	updateField(scope, fieldName, {
		configurable: true,
		get: ( ) => v,
		set: (x) => {
			v = x;
			delete scope[getParsedDateKey(fieldName)];
		}
	});

	updateField(scope, getMethod(fieldName), {
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
	let value = valueIn !== None ? valueIn : defaultValue;

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

		return data;
	}
}
