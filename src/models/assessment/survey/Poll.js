import {
	ASSESSMENT_HISTORY_LINK,
	SURVEY_AGGREGATED_LINK,
	SURVEY_REPORT_LINK,
} from '../../../constants.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Question from '../Question.js';

import PollSubmission from './PollSubmission.js';

export default class Poll extends Question {
	static MimeType = COMMON_PREFIX + 'napoll';

	isPoll = true;

	get hasAggregationData() {
		return this.hasLink(SURVEY_AGGREGATED_LINK);
	}

	get hasReport() {
		return this.hasLink(SURVEY_REPORT_LINK);
	}

	getAggregated() {
		let parent = this.parent();

		if (!this.hasLink(SURVEY_AGGREGATED_LINK) && parent.getAggregated) {
			return parent
				.getAggregated()
				.then(x => x.getQuestion(this.getID()));
		}

		return this.fetchLink(SURVEY_AGGREGATED_LINK);
	}

	getSubmission() {
		return PollSubmission.build(this);
	}

	loadPreviousSubmission() {
		return this.fetchLink(ASSESSMENT_HISTORY_LINK);
	}

	preflight(data) {
		return this.fetchLink({
			method: 'put',
			mode: 'raw',
			rel: 'preflight_update',
			data,
		});
	}
}

Registry.register(Poll);
