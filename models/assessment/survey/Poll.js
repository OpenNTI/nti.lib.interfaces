import Question from '../Question';

import {HISTORY_LINK} from '../Constants';

export default class Poll extends Question {
	constructor (service, parent, data) {
		super(service, parent, data, {isPoll: true});
	}


	getSubmissionModel () {
		return this.getModel('assessment.pollsubmission');
	}


	getSubmission () {
		let s = super.getSubmission();

		s.pollId = s.questionId;
		delete s.questionId;

		return s;
	}


	loadPreviousSubmission () {
		return this.fetchLinkParsed(HISTORY_LINK);
	}
}
