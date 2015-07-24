import isFunction from '../../utils/isfunction';

const BLACK_LISTED = {
	_events: true
};

export default {

	getData () {
		let d = {};

		let get = v => {
			if (Array.isArray(v)) {
				v = v.map(x => this.getData.call(x));

			} else if (v && isFunction(v.getData)) {
				v = v.getData();
			}

			return v;
		};

		for (let k of Object.keys(this)) {
			let v = this[k];
			if (v !== void undefined && !BLACK_LISTED[k] && !isFunction(v)) {
				let translator = `translate:${k}`;

				d[k] = (this[translator] && isFunction(this[translator]))
					? this[translator](v)
					: get(v);
			}
		}

		return d;
	}

};
