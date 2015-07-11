import isFunction from '../../utils/isfunction';

const BLACK_LISTED = {
	_events: true
};

export default {

	getData () {
		let d = {};

		for (let k of Object.keys(this)) {
			let v = this[k];
			if (v !== void undefined && !BLACK_LISTED[v] && !isFunction(v)) {
				let translator = `translate:${k}`;
				if (v && isFunction(v.getData)) {
					v = v.getData();
				}

				d[k] = (this[translator] && isFunction(this[translator]))
					? this[translator](v) : v;
			}
		}

		return d;
	}

};
