import Base from '../../Base';
import {
	Parser as parse
} from '../../../constants';

import Submission from '../../../mixins/Submission';

export default class AssignmentSubmission extends Base {

	constructor (service, parent, data, submitTo) {
		super(service, parent, data, Submission, {
			MimeType: 'application/vnd.nextthought.assessment.assignmentsubmission'
		});

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
