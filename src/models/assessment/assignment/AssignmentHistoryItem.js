import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentHistoryItem extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.assignmenthistoryitem',
		COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitem',
	]

	static Fields = {
		...Base.Fields,
		'Feedback':            { type: 'model[]'               },
		'Grade':               { type: 'model',  name: 'grade' },
		'Submission':          { type: 'model'                 },
		'SyntheticSubmission': { type: 'boolean'               },
		'pendingAssessment':   { type: 'model'                 },
		'MetadataAttemptItem': { type: 'model' 				   },
	}


	getQuestions () {
		let submission = this.pendingAssessment || this.Submission;
		return submission ? submission.getQuestions() : [];
	}


	get feedbackCount () {
		const {Feedback: list} = this;
		return (list || []).length;
	}


	get completed () {
		const {Submission: s = null} = this;
		return s && s.getCreatedTime();
	}


	isSubmitted () {
		return !!this.Submission;
	}


	isGradeExcused () {
		let g = this.grade || false;
		return g && g.isExcused();
	}


	isSyntheticSubmission () {
		return !!this.SyntheticSubmission;
	}


	getGradeValue () {
		let g = this.grade;
		return g && g.value;
	}

}
