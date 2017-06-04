import {Service, ReParent, Parser as parse} from '../../constants';
import submission from '../../mixins/Submission';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class QuestionSetSubmission extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.questionsetsubmission'

	static build (questionSet) {
		const data = {
			questionSetId: questionSet.getID(),
			ContainerId: questionSet.containerId,
			CreatorRecordedEffortDuration: null,
			questions: questionSet.questions.map(q => q.getSubmission())
		};

		const s = new this(questionSet[Service], null, data);
		s.questions.forEach(q => q[ReParent](s));
		return s;
	}

	constructor (service, parent, data) {
		super(service, parent, data, submission, {
			MimeType: 'application/vnd.nextthought.assessment.questionsetsubmission'
		});

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
