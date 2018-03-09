import {mixin} from 'nti-lib-decorators';

import {Service} from '../../constants';
import Submission from '../../mixins/Submission';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin(Submission)
class QuestionSetSubmission extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.questionsetsubmission'

	static Fields = {
		...Base.Fields,
		'questions':                     { type: 'model[]' },
		'questionSetId':                 { type: 'string'  },
		'ContainerId':                   { type: 'string'  },
		'CreatorRecordedEffortDuration': { type: 'number'  },
	}


	static build (questionSet) {
		const data = {
			MimeType: QuestionSetSubmission.MimeType,
			questionSetId: questionSet.getID(),
			ContainerId: questionSet.containerId,
			CreatorRecordedEffortDuration: null,
			questions: questionSet.questions.map(q => q.getSubmission())
		};

		const s = new this(questionSet[Service], null, data);
		s.questions.forEach(q => q.reparent(s));
		return s;
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
