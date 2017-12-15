import isFunction from 'is-function';

import {readValueFor} from './Fields';

const BLACK_LISTED = {
	Class: true,
	_events: true
};


function decode (fields, key) {
	//convert map to list (applying tke key as a property of the field)
	const fieldList = Object.keys(fields).map(x => ({...fields[x], key: x}));
	//See if the key we are decoding is renamed...
	const field = fieldList.find(x => x.name === key) || {};
	//Return the actual key of the renamed field, or the original
	return field.key || key;
}


export default {
	toJSON () { return this.getData(); },


	getData () {
		let d = {};

		const get = v => {
			if (Array.isArray(v)) {
				v = v.map(x => get(x));

			} else if (v && isFunction(v.getData)) {
				v = v.getData();
			}

			return v;
		};


		function isBlackListed (scope, k) {
			let overrides = scope.BLACK_LIST_OVERRIDE;
			if (overrides && overrides[k]) {
				return false;
			}

			return BLACK_LISTED[k];
		}

		const {Fields = {}} = this.constructor;
		//Sets dedupe values...
		const keys = new Set([
			...Object.keys(Fields),
			...Object.keys(this).map(k => decode(Fields, k))
		]);


		for (let k of keys) {
			const v = readValueFor(this, k);

			if (v !== void undefined && !isBlackListed(this, k) && !isFunction(v)) {
				let translator = `translate:${k}`;

				d[k] = (this[translator] && isFunction(this[translator]))
					? this[translator](v)
					: get(v);
			}
		}

		return d;
	}

};
