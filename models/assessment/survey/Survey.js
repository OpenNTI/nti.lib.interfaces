import QuestionSet from '../QuestionSet';

import {HISTORY_LINK} from '../Constants'; //Assessment Constants

import {AGGREGATED_LINK, REPORT_LINK} from './Constants'; //Survey Constants

const AGGREGATED = Symbol(AGGREGATED_LINK);

export default class Survey extends QuestionSet {
	constructor (service, parent, data) {
		super(service, parent, data);
	}


	get hasAggregationData () {
		return this.hasLink(AGGREGATED_LINK);
	}


	get hasReport () {
		return this.hasLink(REPORT_LINK);
	}


	getAggregated () {
		let p = this[AGGREGATED];

		if (!p) {
			p = this[AGGREGATED] = this.fetchLinkParsed(AGGREGATED_LINK);
		}

		return p;
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
