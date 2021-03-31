import { decorate } from '@nti/lib-commons';
import { mixin /*, readonly*/ } from '@nti/lib-decorators';

import {
	ASSESSMENT_HISTORY_LINK,
	SURVEY_AGGREGATED_LINK,
	SURVEY_REPORT_LINK,
} from '../../../constants.js';
import { model, COMMON_PREFIX } from '../../Registry.js';
import Question from '../Question.js';

import PollSubmission from './PollSubmission.js';

class Poll extends Question {
	static MimeType = COMMON_PREFIX + 'napoll';

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

		return this.fetchLinkParsed(SURVEY_AGGREGATED_LINK);
	}

	getSubmission() {
		return PollSubmission.build(this);
	}

	loadPreviousSubmission() {
		return this.fetchLinkParsed(ASSESSMENT_HISTORY_LINK);
	}

	preflight(data) {
		return this.putToLink('preflight_update', data);
	}
}

export default decorate(Poll, {
	with: [model, mixin({ /*@readonly*/ isPoll: true })],
});
