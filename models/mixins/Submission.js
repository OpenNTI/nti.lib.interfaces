import {Parser as parse} from '../../CommonSymbols';

const Service = Symbol.for('Service');
const Submitted = Symbol('Submitted');

export default {

	canSubmit () {
		if (this.isSubmitted()) {return false;}

		var list = this.questions || this.parts || [];

		return list.reduce((can, q) => can || q.canSubmit(), false);
	},


	isSubmitted () {
		var p;

		//Test if we are explicitly marked submitted
		return Boolean(this[Submitted] ||

			//Then check parent for submitted
			((p = this.parent('isSubmitted')) && p.isSubmitted()));

	},


	markSubmitted (v) {
		this[Submitted] = v;
	},


	submit () {
		var target = (this[Service].getCollectionFor(this) || {}).href;
		if (!target) {
			console.error('No where to save object: %o', this);
		}

		return this[Service]
			.post(target, this.getData())
			.then(data => this[parse](data));
	}
};
