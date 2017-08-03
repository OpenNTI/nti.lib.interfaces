import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentPart extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.assignmentpart'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('question_set');
	}


	containsId (id) {
		const {question_set: o, QuestionSetId} = this;
		return QuestionSetId === id || (o && (o.getID() === id || o.containsId(id)));
	}

	getQuestion (id) {
		const {question_set: o} = this;
		return o && o.getQuestion(id);
	}


	getQuestions () {
		const {question_set: o} = this;
		return o ? o.getQuestions() : [];
	}


	getQuestionCount () {
		const {question_set: o} = this;
		return o ? o.getQuestionCount() : 0;
	}


	getSubmission () {
		const {question_set: o} = this;
		return o && o.getSubmission();
	}

}
