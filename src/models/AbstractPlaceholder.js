import Base from './Base';
import uuid from 'node-uuid';


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

		const makeMarker = MarkerFactory(this);

		Object.defineProperties(this, {
			isPlaceholder: {
				value: true
			},
			NTIID: {
				value: uuid.v4()
			},
			BLACK_LIST_OVERRIDE: {
				value: {Class: true}
			}
		});

		makeMarker('isSaving');
		makeMarker('error', 'isSaving');
	}
}
