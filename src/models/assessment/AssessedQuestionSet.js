import {mixin} from 'nti-lib-decorators';

import assessed from '../../mixins/AssessedAssessmentPart';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin(assessed)
class AssessedQuestionSet extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.assessedquestionset'

	static Fields = {
		...Base.Fields,
		'questions': { type: 'model[]' },
	}


	getQuestion (id) {
		return this.questions.reduce((found, q) =>
			found || (q.getID() === id && q), null);
	}


	getQuestions () {
		return this.questions.slice();
	}


	isSubmitted () {
		return true;
	}


	getTotal () {
		return (this.questions || []).length;
	}


	getCorrect () {
		return (this.questions || []).reduce((sum, question) =>
			sum + (question.isCorrect() ? 1 : 0), 0);
	}


	getIncorrect () {
		return this.getTotal() - this.getCorrect();
	}


	getScore () {
		try {
			return 100 * (this.getCorrect() / this.getTotal());
		} catch (e) {
			return 0;
		}
	}
}
