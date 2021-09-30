import { Service } from '../../constants.js';
import Submission from '../../mixins/Submission.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class QuestionSetSubmission extends Submission(Base) {
	static MimeType = COMMON_PREFIX + 'assessment.questionsetsubmission';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'questions':                     { type: 'model[]' },
		'questionSetId':                 { type: 'string'  },
		'ContainerId':                   { type: 'string'  },
		'CreatorRecordedEffortDuration': { type: 'number'  },
	}

	static build(questionSet) {
		const data = {
			MimeType: this.MimeType,
			questionSetId: questionSet.getID(),
			ContainerId: questionSet.containerId,
			CreatorRecordedEffortDuration: null,
			questions: (questionSet.questions ?? []).map(q =>
				q.getSubmission()
			),
			version: questionSet.version,
		};

		const s = new this(questionSet[Service], questionSet, data);
		s.questions?.forEach(q => q.reparent(s));
		return s;
	}

	getQuestion(id) {
		return this.questions.reduce(
			(found, q) => found || (q.getID() === id && q),
			null
		);
	}

	getQuestions() {
		return this.questions.slice();
	}

	countUnansweredQuestions(questionSet) {
		if (questionSet?.questions?.length !== this.questions?.length) {
			throw new Error('Invalid Argument');
		}

		return (
			this.questions?.reduce(
				(sum, q) =>
					sum +
					(questionSet.getQuestion(q.getID()).isAnswered(q) ? 0 : 1),
				0
			) ?? 0
		);
	}
}

Registry.register(QuestionSetSubmission);
