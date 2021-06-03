import { Service, Parser as parse } from '../constants.js';

const Submitted = Symbol('Submitted');

/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class Submission extends Base {
		canSubmit() {
			if (this.isSubmitted()) {
				return false;
			}

			let list = this.questions || this.parts || [];

			return list.reduce((can, q) => can || (q && q.canSubmit()), false);
		}

		isSubmitted() {
			let p;

			//Test if we are explicitly marked submitted
			return Boolean(
				this[Submitted] ||
					//Then check parent for submitted
					((p = this.parent('isSubmitted')) && p.isSubmitted())
			);
		}

		markSubmitted(v) {
			this[Submitted] = v;
		}

		submit() {
			const resolve = () => {
				const course = this.parent('isCourse');
				const link = course && course.getLink('Pages');
				const { href } =
					(!link && this[Service].getCollectionFor(this)) || {};
				return link || href;
			};

			// Try looking up the href to POST to in the service doc's collections...
			// (unless the model has flagged that it prevers Object URL... then short circuit)
			let target =
				this.SubmissionHref ||
				(!this.SubmitsToObjectURL && resolve()) ||
				//If value yet, get/build the Objects URL...
				this[Service].getObjectURL(this.getID());

			const fn = 'onSuccessfulSubmission';
			let submitted = this[fn] ? x => this[fn](x) : () => {};

			if (!target) {
				return Promise.reject('No URL');
			}

			return this[Service].post(target, this.getData())
				.then(data => this[parse](data))
				.then(data =>
					Promise.resolve(submitted(data)).then(() => data)
				);
		}
	};
