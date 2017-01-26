import isFunction from 'is-function';

const BLACK_LISTED = {
	Class: true,
	_events: true
};

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


		for (let k of Object.keys(this)) {
			let v = this[k];
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
