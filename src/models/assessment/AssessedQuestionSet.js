import assessed from '../../mixins/AssessedAssessmentPart.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class AssessedQuestionSet extends assessed(Base) {
	static MimeType = COMMON_PREFIX + 'assessment.assessedquestionset';
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'questions': { type: 'model[]' },
	};

	getQuestion(id) {
		return this.questions.reduce(
			(found, q) => found || (q.getID() === id && q),
			null
		);
	}

	getQuestions() {
		return this.questions.slice();
	}

	isSubmitted() {
		return true;
	}

	getTotal() {
		return (this.questions || []).length;
	}

	getCorrect() {
		return (this.questions || []).reduce(
			(sum, question) => sum + (question.isCorrect() ? 1 : 0),
			0
		);
	}

	getIncorrect() {
		return this.getTotal() - this.getCorrect();
	}

	getScore() {
		try {
			return 100 * (this.getCorrect() / this.getTotal());
		} catch (e) {
			return 0;
		}
	}
}

Registry.register(AssessedQuestionSet);
