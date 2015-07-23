import Base from '../Base';
import {
	Service,
	Parser as parse
} from '../../CommonSymbols';

import HasContent from '../mixins/HasContent';

const Individual = Symbol('Individual');

export default class Question extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, HasContent, {
			isSubmittable: true,
			isQuestion: true
		});

		this.parts = data.parts.map(p=>this[parse](p));

		this[parse]('wordbank');
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


	getVideos () {
		//Eeewww...
		let all = this.getModel('assessment.part').prototype.getVideos.call(this);

		for(let p of this.parts) {
			all.push.apply(all, p.getVideos());
		}
		return all;
	}


	getSubmissionModel() {
		return this.getModel('assessment.questionsubmission');
	}


	getSubmission () {
		let Model = this.getSubmissionModel();
		return Model.build(this[Service], {
			ContainerId: this.containerId,
			NTIID: this.getID(),
			questionId: this.getID(),
			parts: this.parts.map(()=>null)
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
		let expect = this.parts.length;
		let {parts} = questionSubmission;

		return this.parts.filter((p, i)=>p.isAnswered(parts[i])).length === expect;
	}

}
