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
import Pages from '../../content/mixins/Pages';
import QuestionSet from '../QuestionSet';

import SurveySubmission from './SurveySubmission';

const AGGREGATED = Symbol(SURVEY_AGGREGATED_LINK);

class Survey extends QuestionSet {
	static MimeType = COMMON_PREFIX + 'nasurvey'

	static Fields = {
		...QuestionSet.Fields,
		'title':                              { type: 'string' },
		'description':                        { type: 'string' },
		'disclosure':                         { type: 'string' },
		'contents':                           { type: 'string' },
		'PublicationState':                   { type: 'string' },
		'available_for_submission_beginning': { type: 'date'   },
		'available_for_submission_ending':    { type: 'date'   },
		'version':                            { type: 'string' },
		'submissions':                        { type: 'number' }
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

	maybeResetAllSubmissions () {
		return this.hasLink('Reset') ? this.resetAllSubmissions() : Promise.resolve();
	}


	getAssignedDate () {
		return this.getAvailableForSubmissionBeginning();
	}


	getDueDate () {
		return this.getAvailableForSubmissionEnding();
	}

	canSetDueDate () {
		return this.hasLink('date-edit');
	}

	setDueDate (date) {
		return this.save({'available_for_submission_ending': date}, void 0, 'date-edit');
	}


	getPublishDate () {
		return this.isPublished() ? this.getAssignedDate() : null;
	}

	isAvailable () {
		const now = new Date();
		const available = this.getAvailableForSubmissionBeginning();

		return this.isPublished() && now > available;
	}

	/**
	 * Sets the publish state of the survey
	 *
	 * @param {boolean|Date} state Publish States: Publish - True, Unpublish - False, or Schedule - Date
	 * @returns {Promise} Fulfills when the state is set
	 */
	setPublishState (state) {
		const isDate = state instanceof Date;
		const value = isDate ? true : !!state;

		const work = (!isDate && !value)
			? Promise.resolve()
			: this.save({ 'available_for_submission_beginning': isDate ? state : null}, void 0, 'date-edit');

		return work.then(() => {
			if (this.canPublish() || this.canUnpublish()) {
				return Publishable.setPublishState.call(this, value, 'available_for_submission_beginning', 'questions', 'IsAvailable');
			}
		});
	}
}

export default decorate(Survey, {with:[
	model,
	mixin(Completable, Publishable, Pages),
]});
