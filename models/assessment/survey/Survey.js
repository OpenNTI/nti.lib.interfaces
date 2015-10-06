import QuestionSet from '../QuestionSet';

import {HISTORY_LINK} from '../Constants';

export default class Survey extends QuestionSet {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	getSubmissionModel () {
		return this.getModel('assessment.surveysubmission');
	}

	getSubmission () {
		let s = super.getSubmission();

		s.surveyId = s.questionSetId;
		delete s.questionSetId;

		return s;
	}


	loadPreviousSubmission () {
		return this.fetchLinkParsed(HISTORY_LINK);
	}
}
