import pluck from 'nti-commons/lib/pluck';

import Base from '../Base';
import {
	Service,
	ReParent,
	Parser as parse
} from '../../constants';

let SUBMITTED_TYPE = 'application/vnd.nextthought.assessment.assessedquestionset';

export default class QuestionSet extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, {isSubmittable: true});

		this[parse]('questions', []);
	}

	/**
	 * Is the question order set to be randomized.
	 *
	 * @return {boolean} yes or no.
	 */
	get isRandomized () {
		if (!this.hasLink('edit')) {
			throw new Error('Illegal Access. This instance is not editable.');
		}
		return this.hasLink('Unrandomize');
	}

	/**
	 * Are the question parts set to use the Randomized Part variant?
	 *
	 * @return {boolean} yes or no.
	 */
	get isPartTypeRandomized () {
		if (!this.hasLink('edit')) {
			throw new Error('Illegal Access. This instance is not editable.');
		}
		return this.hasLink('UnrandomizePartsType');
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


	/**
	 * Returns the max number of questions from the set to pick from.
	 * @return {number} max or null if unrestricted
	 */
	getQuestionLimit () {
		return this.draw;
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

	getSubmissionModel () {
		return this.getModel('assessment.questionsetsubmission');
	}

	getSubmission () {
		let Model = this.getSubmissionModel();
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


	/**
	 * Toggle the Randomization state of Questions or Parts.
	 *
	 * @param  {boolean} parts if true toggles the parts randomization. if false (default) it will toggle the randomization of questions.
	 * @return {Promise} The promise of the work being done.
	 */
	toggleRandomized (parts) {
		const cap = (s) => s[0].toUpperCase() + s.substr(1);
		const rel = 'randomize' + (parts ? 'PartsType' : '');

		let link = this.hasLink(cap(rel)) ? cap(rel) : cap(`un${rel}`);
		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links')))
			.then(() => this.onChange('Randomize'));
	}


	toggleRandomizedPartTypes () {
		return this.toggleRandomized(true);
	}


	/**
	 * Set the draw limit. A draw of 'None' or empty will convert the question bank back into a question set.
	 * A limit with an acutal value will convert to a question bank.
	 * @param {number|null} n The limit to set to. Use null if you want to convert back to question set.
	 * @returns {Promise} A promise of the save is returned.
	 */
	setQuestionLimit (n) {
		return this.save({'draw': n});
	}
}
