import {v4 as uuid} from 'uuid';

import Base from './Base';


function MarkerFactory (obj) {
	const markers = {};

	const unmark = (...names) => names.forEach(name => delete markers[name]);

	const mark = (name, value) => {
		if (value) {
			markers[name] = value;
		} else {
			unmark(name);
		}

		if (obj.onChange) {
			obj.onChange();
		}
	};

	return function (name, ...clears) {
		Object.defineProperty(obj, name, {
			configurable: true, //allow these properties to be deleted?
			enumerable: false,
			get: () => markers[name],
			set: (value) => {
				if (value) { unmark(...clears); }
				mark(name, value);
			}
		});
	};
}


export default class Placeholder extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this.keys = new Set(Object.keys(data));

		const makeMarker = MarkerFactory(this);

		Object.defineProperties(this, {
			isPlaceholder: {
				value: true
			},
			NTIID: {
				value: uuid()
			},
			BLACK_LIST_OVERRIDE: {
				value: {Class: true}
			}
		});

		makeMarker('isSaving');
		makeMarker('error', 'isSaving');
	}

	getData () {
		const data = {};

		for (let key of this.keys) {
			if(this[key] !== undefined) {
				data[key] = this[key];
			}
		}

		return data;
	}

	mergeData (data) {
		const newKeys = Object.keys(data);

		for (let key of newKeys) {
			this.keys.add(key);
		}

		Object.assign(this, data);
	}
}
