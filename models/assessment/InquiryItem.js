import Base from '../Base';

import {
	Parser as parse
} from '../../CommonSymbols';

export default class InqueryItem extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		//CatalogEntryNTIID
		this[parse]('Submission');
	}

	getQuestions () {
		let submission = this.pendingAssessment || this.Submission;
		return submission ? submission.getQuestions() : [];
	}


	isSubmitted () {
		return !!this.Submission;
	}
}
