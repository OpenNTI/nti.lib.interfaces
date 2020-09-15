import {decorate, wait} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import {
	ASSESSMENT_HISTORY_LINK,
	SURVEY_AGGREGATED_LINK,
	SURVEY_REPORT_LINK
} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Publishable from '../../../mixins/Publishable';
import Completable from '../../../mixins/Completable';
import QuestionSet from '../QuestionSet';

import SurveySubmission from './SurveySubmission';

const AGGREGATED = Symbol(SURVEY_AGGREGATED_LINK);

class Survey extends QuestionSet {
	static MimeType = COMMON_PREFIX + 'nasurvey'

	static Fields = {
		...QuestionSet.Fields,
		'title':            { type: 'string' },
		'PublicationState': { type: 'string' },
	}

	get hasAggregationData () {
		return this.hasLink(SURVEY_AGGREGATED_LINK);
	}


	get hasReport () {
		return this.hasLink(SURVEY_REPORT_LINK);
	}


	getAggregated () {
		let p = this[AGGREGATED];

		if (!p) {
			p = this[AGGREGATED] = this.fetchLinkParsed(SURVEY_AGGREGATED_LINK);
			//cleanup
			p.catch(()=> null)
				.then(()=> wait(1000)) //one second after promise completes.
				.then(()=> delete this[AGGREGATED]);
		}

		return p;
	}


	getSubmission () {
		return SurveySubmission.build(this);
	}


	loadPreviousSubmission () {
		return this.fetchLinkParsed(ASSESSMENT_HISTORY_LINK);
	}

	/**
	 * DANGER: Resets all submissions on an assignment across all students.
	 * @returns {Promise} Promise that fulfills with request code.
	 */
	resetAllSubmissions () {
		return this.postToLink('Reset')
			.then(o => this.refresh(o))
			.then(() => this.onChange('all'));
	}
}

export default decorate(Survey, {with:[
	model,
	mixin(Completable, Publishable),
]});
