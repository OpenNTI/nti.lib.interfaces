import Question from '../Question';

import {HISTORY_LINK} from '../Constants'; //Assessment Constants

import {AGGREGATED_LINK, REPORT_LINK} from './Constants'; //Survey Constants

export default class Poll extends Question {
	constructor (service, parent, data) {
		super(service, parent, data, {isPoll: true});
	}


	get hasAggregationData () {
		return this.hasLink(AGGREGATED_LINK);
	}


	get hasReport () {
		return this.hasLink(REPORT_LINK);
	}


	getAggregated () {
		let parent = this.parent();

		if (!this.hasLink(AGGREGATED_LINK) && parent.getAggregated) {
			return parent.getAggregated()
				.then(x=> x.getQuestion(this.getID()));
		}

		return this.fetchLinkParsed(AGGREGATED_LINK);
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
