import Base from '../Base';

import {
	Parser as parse
} from '../../CommonSymbols';

export default class InqueryItemResponse extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Aggregated');
		this[parse]('Submission');
	}

	getQuestions () {
		let submission = this.Submission;
		return !submission ? [] : submission.getQuestions();
	}


	isSubmitted () {
		return !!this.Submission || this.Aggregated;
	}
}
