import Question from '../Question';

import {
	ASSESSMENT_HISTORY_LINK,
	SURVEY_AGGREGATED_LINK,
	SURVEY_REPORT_LINK
} from '../../../constants';

import PollSubmission from './PollSubmission';

export default class Poll extends Question {
	constructor (service, parent, data) {
		super(service, parent, data, {isPoll: true});
	}


	get hasAggregationData () {
		return this.hasLink(SURVEY_AGGREGATED_LINK);
	}


	get hasReport () {
		return this.hasLink(SURVEY_REPORT_LINK);
	}


	getAggregated () {
		let parent = this.parent();

		if (!this.hasLink(SURVEY_AGGREGATED_LINK) && parent.getAggregated) {
			return parent.getAggregated()
				.then(x=> x.getQuestion(this.getID()));
		}

		return this.fetchLinkParsed(SURVEY_AGGREGATED_LINK);
	}


	getSubmissionModel () {
		return PollSubmission;
	}


	getSubmission () {
		let s = super.getSubmission();

		s.pollId = s.questionId;
		delete s.questionId;

		return s;
	}


	loadPreviousSubmission () {
		return this.fetchLinkParsed(ASSESSMENT_HISTORY_LINK);
	}
}
