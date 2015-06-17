import isFunction from '../../utils/isfunction';

export default {

	getData () {
		let d = {};

		for (let k of Object.keys(this)) {
			let v = this[k];
			if (v !== void undefined && !isFunction(v)) {
				let translator = `translate:${v}`;
				if (v && isFunction(v.getData)) {
					v = v.getData();
				}

				d[k] = (d[translator] && isFunction(d[translator]))
					? d[translator](v) : v;
			}
		}

		return d;
	}

};
