import {mixin} from '@nti/lib-decorators';

import Submission from '../../../mixins/Submission';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

const RELS = {
	ASSIGNMENT: 'Assignment',
	ASSIGNMENT_HISTORY_ITEM: 'AssignmentHistoryItem',
	HISTORY: 'History',
};

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
		'version':                       { type: 'string'                    },
		'isPracticeSubmission':          { type: 'boolean'                   }
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
		return this.fetchLinkParsed(RELS.ASSIGNMENT_HISTORY_ITEM);
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
		if (p.hasLink(RELS.HISTORY)) {
			const history = await p.fetchLinkParsed(RELS.HISTORY);
	
			if(history && history.MetadataAttemptItem && history.MetadataAttemptItem.hasLink(RELS.ASSIGNMENT)) {
				const newAssignmentData = await history.MetadataAttemptItem.fetchLink(RELS.ASSIGNMENT);
				await p.refresh(newAssignmentData);
			}
		}

		p.onChange('submit-state');
		return p;
	}
}
