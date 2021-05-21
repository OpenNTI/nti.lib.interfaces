import { __readValue, getType } from './Fields.js';

const isFunction = f => typeof f === 'function';

const BLACK_LISTED = {
	Class: true,
	_events: true,
};

function decode(fields, key) {
	//convert map to list (applying tke key as a property of the field)
	const fieldList = Object.keys(fields).map(x => ({ ...fields[x], key: x }));
	//See if the key we are decoding is renamed...
	const field = fieldList.find(x => x.name === key) || {};
	//Return the actual key of the renamed field, or the original
	return field.key || key;
}

const Serializing = new Set();

function getData({ diff = false } = {}) {
	let d = {};

	try {
		const { Fields = {} } = getType(this);
		//Sets dedupe values...
		const keys = new Set([
			...Object.keys(Fields),
			...Object.keys(this).map(k => decode(Fields, k)),
		]);

		Serializing.add(this);

		for (let k of keys) {
			// skip unchanged values
			if (diff && !this.__isDirty(k)) {
				continue;
			}

			const v = __readValue(this, k);

			if (
				v !== void undefined &&
				!isBlackListed(this, k) &&
				!isFunction(v)
			) {
				let translator = `translate:${k}`;

				d[k] =
					this[translator] && isFunction(this[translator])
						? this[translator](v)
						: get(v, { diff });
			}
		}
	} finally {
		Serializing.delete(this);
	}

	return d;
}

/**
 * @template {new (...args: any[]) => {}} T
 * @param {T} Base
 * @mixin
 */
export const JSONValue = (Base = Object) => {
	class JSONValueImpl extends Base {
		toJSON() {
			return this.getData();
		}
	}

	JSONValueImpl.prototype.getData = getData;

	return JSONValueImpl;
};

function get(v, opts) {
	if (Array.isArray(v)) {
		return v.map(get);
	}

	if (Serializing.has(v)) {
		// eslint-disable-next-line no-console
		console.warn('Data Cycle Detected');
		return void 0;
	}

	return isFunction(v?.getData) || getType(v) === Object
		? getData.call(v, opts)
		: isFunction(v?.toJSON)
		? v.toJSON()
		: v;
}

function isBlackListed(scope, k) {
	let overrides = scope.BLACK_LIST_OVERRIDE;
	// Allow for a key=>boolean map and an implied true list of keys (array of strings)
	if (Array.isArray(overrides)) {
		overrides = overrides.reduce((o, x) => (o[x] = true), {});
	}
	if (overrides?.[k]) {
		return false;
	}

	return BLACK_LISTED[k];
}
