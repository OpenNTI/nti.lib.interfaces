import Base from '../Base';
import {
	Service,
	Parser as parse
} from '../../constants';

import HasContent from '../mixins/HasContent';

const Individual = Symbol('Individual');

export default class Question extends Base {
	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, HasContent, {
			isSubmittable: true,
			isQuestion: true
		}, ...mixins);

		this[parse]('parts', []);
		this[parse]('wordbank');
	}


	[Symbol.iterator] () {
		let snapshot = this.parts.slice();
		let {length} = snapshot;
		let index = 0;

		return {

			next () {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			}

		};
	}



	get individual () {
		let result = this[Individual];
		if (!this.hasOwnProperty(Individual)) {
			let Model = this.getModel('questionset');
			result = !this.parent({test: p=>p instanceof Model});
			this[Individual] = result; //stop computing
		}
		return result;
	}


	getPart (index) {
		return (this.parts || [])[index];
	}


	getVideos () {
		//Eeewww...
		let all = this.getModel('assessment.part').prototype.getVideos.call(this);

		for(let p of this.parts) {
			all.push.apply(all, p.getVideos());
		}
		return all;
	}


	getSubmissionModel () {
		return this.getModel('assessment.questionsubmission');
	}


	getSubmission () {
		let Model = this.getSubmissionModel();
		let {parts} = this;
		return Model.build(this[Service], {
			ContainerId: this.containerId,
			NTIID: this.getID(),
			questionId: this.getID(),
			parts: parts && parts.map(()=>null)
		});
	}


	loadPreviousSubmission () {
		// let dataProvider = this.parent('getUserDataLastOfType');
		// if (!dataProvider) {
		// 	return Promise.reject('Nothing to do');
		// }
		//
		// return dataProvider.getUserDataLastOfType(SUBMITTED_TYPE);
		return Promise.reject('Individual Question history not implemented');
	}



	isAnswered (questionSubmission) {
		let items = this.parts || [];
		let expect = items.length;
		let {parts} = questionSubmission;

		return items.filter((p, i)=> p && p.isAnswered && p.isAnswered(parts[i])).length === expect;
	}

}
