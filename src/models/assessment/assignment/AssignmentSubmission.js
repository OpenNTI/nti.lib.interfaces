import {mixin} from 'nti-lib-decorators';

import {Parser as parse} from '../../../constants';
import Submission from '../../../mixins/Submission';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

@model
@mixin(Submission)
export default class AssignmentSubmission extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.assignmentsubmission',
		COMMON_PREFIX + 'assessment.assignmentsubmissionpendingassessment',
	]

	constructor (service, parent, data, submitTo) {
		super(service, parent, data);
		this.MimeType = this.MimeType || AssignmentSubmission.MimeType[0];

		Object.defineProperties(this, {
			SubmissionHref: {value: submitTo},
			SubmitsToObjectURL: {value: true}
		});

		// CreatorRecordedEffortDuration: 0
		this[parse]('parts', []);
	}


	/**
	 * Load the history directly from the Link on this object.
	 *
	 * @return {Promise} The history.
	 */
	getHistory () {
		return this.fetchLinkParsed('AssignmentHistoryItem');
	}


	getID () {
		return this.NTIID || this.assignmentId;
	}


	getQuestion (id) {
		return (this.parts || []).filter(x => x).reduce((found, p) =>
			found || p.getQuestion(id), null);
	}


	getQuestions () {
		return (this.parts || []).filter(x => x).reduce((list, p) =>
			list.concat(p.getQuestions()), []);
	}


	countUnansweredQuestions (assignment) {
		let parts = this.parts || [];

		//Verify argument is an Assignment model
		if (!assignment || !assignment.parts || assignment.parts.length !== parts.length) {
			throw new Error('Invalid Argument');
		}

		return parts.filter(x => x).reduce((sum, q, i) =>
			sum + q.countUnansweredQuestions(assignment.parts[i].question_set), 0);
	}


	onSuccessfulSubmission () {
		let p = this.parent();
		if (!p || !p.getSubmission) {
			return;
		}

		return p.refresh().then(r => {
			p.onChange('submit-state');
			return r;
		});
	}
}
