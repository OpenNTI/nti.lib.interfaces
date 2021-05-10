import { __readValue } from './Fields.js';

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

const Serializing = Symbol('Serializing');

export const JSONValue = {
	toJSON() {
		return this.getData();
	},

	getData({ diff = false } = {}) {
		let d = {};

		try {
			const { Fields = {} } = this.constructor;
			//Sets dedupe values...
			const keys = new Set([
				...Object.keys(Fields),
				...Object.keys(this).map(k => decode(Fields, k)),
			]);

			this[Serializing] = true;

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
			delete this[Serializing];
		}

		return d;
	},
};

function get(v, opts) {
	if (Array.isArray(v)) {
		return v.map(get);
	}

	if (v?.[Serializing]) {
		// eslint-disable-next-line no-console
		console.warn('Data Cycle Detected');
		return void 0;
	}

	if (v?.constructor === Object && v.getData !== JSONValue.getData) {
		v = { ...v, ...JSONValue };
	}

	return isFunction(v?.getData)
		? v.getData(opts)
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

export default Base => (Object.assign(Base.prototype, JSONValue), Base);
