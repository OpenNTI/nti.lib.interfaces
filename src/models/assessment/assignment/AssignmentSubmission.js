import {mixin} from '@nti/lib-decorators';

import Submission from '../../../mixins/Submission';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
@mixin(Submission)
class AssignmentSubmission extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.assignmentsubmission',
		COMMON_PREFIX + 'assessment.assignmentsubmissionpendingassessment',
	]

	static Fields = {
		...Base.Fields,
		'assignmentId':                  { type: 'string'                    },
		'parts':                         { type: 'model[]', defaultValue: [] },
		'CreatorRecordedEffortDuration': { type: 'number'                    },
		'version':                       { type: 'string'                    }
	}

	constructor (service, parent, data, submitTo) {
		super(service, parent, data);
		this.MimeType = this.MimeType || AssignmentSubmission.MimeType;

		Object.defineProperties(this, {
			SubmissionHref: {value: submitTo},
			SubmitsToObjectURL: {value: true}
		});
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


	async onSuccessfulSubmission () {
		let p = this.parent();
		if (!p || !p.getSubmission) {
			return;
		}

		await p.refresh();
		const history = await p.fetchLinkParsed('History');

		if(history && history.MetadataAttemptItem && history.MetadataAttemptItem.hasLink('Assignment')) {
			const newAssignmentData = await history.MetadataAttemptItem.fetchLink('Assignment');
			p.refresh(newAssignmentData);
		}

		p.onChange('submit-state');
		return p;
	}
}
