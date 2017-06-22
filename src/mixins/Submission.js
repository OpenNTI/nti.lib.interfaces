import {Service, Parser as parse} from '../constants';

const Submitted = Symbol('Submitted');

export default {

	canSubmit () {
		if (this.isSubmitted()) { return false; }

		let list = this.questions || this.parts || [];

		return list.reduce((can, q) => can || (q && q.canSubmit()), false);
	},


	isSubmitted () {
		let p;

		//Test if we are explicitly marked submitted
		return Boolean(this[Submitted] ||

			//Then check parent for submitted
			((p = this.parent('isSubmitted')) && p.isSubmitted()));

	},


	markSubmitted (v) {
		this[Submitted] = v;
	},


	submit () {
		// Try looking up the href to POST to in the service doc's collections...
		// (unless the model has flagged that it prevers Object URL... then short circuit)
		let target = this.SubmissionHref
					|| ((!this.SubmitsToObjectURL && this[Service].getCollectionFor(this)) || {}).href
			//If value yet, get/build the Objects URL...
					|| this[Service].getObjectURL(this.getID());

		const fn = 'onSuccessfulSubmission';
		let submitted = this[fn]
			? x => this[fn](x)
			: ()=> {};

		if (!target) {
			return Promise.reject('No URL');
		}

		return this[Service]
			.post(target, this.getData())
			.then(data => this[parse](data))
			.then(data => Promise.resolve(submitted(data)).then(()=> data));
	}
};
