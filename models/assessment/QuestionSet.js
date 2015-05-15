import Base from '../Base';
import {
	Service,
	ReParent,
	Parser as parse
} from '../../CommonSymbols';

let SUBMITTED_TYPE = 'application/vnd.nextthought.assessment.assessedquestionset';

export default class QuestionSet extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, {isSubmittable: true});

		this.questions = data.questions.map(q=>this[parse](q));
	}

	/**
	 * Checks to see if the NTIID is within this QuestionSet
	 *
	 * @param {string} id NTIID
	 * @returns {boolean} true if contains the id, false otherwise.
	 */
	containsId (id) {
		return !!this.getQuestion(id);
	}


	getQuestion (id) {
		return this.questions.reduce((found, q) => found || (q.getID() === id && q), null);
	}


	getQuestions () {
		return this.questions.slice();
	}


	getQuestionCount () {
		return this.questions.length;
	}


	getSubmission () {
		let Model = this.getModel('assessment.questionsetsubmission');
		let s = Model.build(this[Service], {
			questionSetId: this.getID(),
			ContainerId: this.containerId,
			CreatorRecordedEffortDuration: null,
			questions: []
		});

		s.questions = this.questions.map(q => {
			q = q.getSubmission();
			q[ReParent](s);
			return q;
		});

		return s;
	}


	loadPreviousSubmission () {
		let dataProvider = this.parent('getUserDataLastOfType');
		if (!dataProvider) {
			return Promise.reject('Nothing to do');
		}

		return dataProvider.getUserDataLastOfType(SUBMITTED_TYPE);
	}
}
