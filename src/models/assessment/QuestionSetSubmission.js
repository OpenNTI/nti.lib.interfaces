import Base from '../Base';
import {
	Service,
	ReParent,
	Parser as parse
} from '../../constants';
import submission from '../mixins/Submission';
import {resolveSubmitTo} from './utils';

export default class QuestionSetSubmission extends Base {

	static COURSE_SUBMISSION_REL = 'Assessments';

	static build (questionSet) {
		const data = {
			questionSetId: questionSet.getID(),
			ContainerId: questionSet.containerId,
			CreatorRecordedEffortDuration: null,
			questions: questionSet.questions.map(q => q.getSubmission())
		};

		const submitTo = resolveSubmitTo(questionSet, this.COURSE_SUBMISSION_REL);
		const s = new this(questionSet[Service], null, data, submitTo);
		s.questions.forEach(q => q[ReParent](s));
		return s;
	}

	constructor (service, parent, data, submitTo) {
		super(service, parent, data, submission, {
			MimeType: 'application/vnd.nextthought.assessment.questionsetsubmission'
		});

		Object.defineProperty(this, 'SubmissionHref', {value: submitTo});

		// CreatorRecordedEffortDuration: 0
		this[parse]('questions', []);
	}


	getQuestion (id) {
		return this.questions.reduce((found, q) => found || (q.getID() === id && q), null);
	}

	getQuestions () {
		return this.questions.slice();
	}

	countUnansweredQuestions (questionSet) {
		if (!questionSet || !questionSet.questions || questionSet.questions.length !== this.questions.length) {
			throw new Error('Invalid Argument');
		}

		return this.questions.reduce((sum, q) =>
			sum + (questionSet.getQuestion(q.getID()).isAnswered(q) ? 0 : 1), 0);
	}
}
