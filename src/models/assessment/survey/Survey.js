import {wait} from 'nti-commons';

import {
	ASSESSMENT_HISTORY_LINK,
	SURVEY_AGGREGATED_LINK,
	SURVEY_REPORT_LINK
} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import QuestionSet from '../QuestionSet';

import SurveySubmission from './SurveySubmission';

const AGGREGATED = Symbol(SURVEY_AGGREGATED_LINK);

export default
@model
class Survey extends QuestionSet {
	static MimeType = COMMON_PREFIX + 'nasurvey'

	constructor (service, parent, data) {
		super(service, parent, data);
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
}
