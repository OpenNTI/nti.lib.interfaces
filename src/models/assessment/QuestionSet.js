import {decorate, pluck} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import Completable from '../../mixins/Completable';
import PlacementProvider from '../../authoring/placement/providers/QuestionSet';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import SubmittableIdentity from './mixins/SubmittableIdentity';
import QuestionSetSubmission from './QuestionSetSubmission';

const SUBMITTED_TYPE = 'application/vnd.nextthought.assessment.assessedquestionset';

class QuestionSet extends Base {
	static MimeType = [
		COMMON_PREFIX + 'questionset',
		COMMON_PREFIX + 'naquestionbank',
		COMMON_PREFIX + 'naquestionset',
		COMMON_PREFIX + 'narandomizedquestionset',
		COMMON_PREFIX + 'assessment.randomizedquestionset',
	]

	static Fields = {
		...Base.Fields,
		'draw':                                  { type: 'number',                               },
		'question-count':                        { type: 'number?'                               },
		'questions':                             { type: 'model[]'                               },
		'Randomized':                            { type: 'boolean', name: 'isRandomized'         },
		'RandomizedPartsType':                   { type: 'boolean', name: 'isPartTypeRandomized' },
		'containerId':                           { type: 'string'                                },
		'LimitedEditingCapabilities':            { type: 'boolean'                               },
		'LimitedEditingCapabilitiesSavepoints':  { type: 'boolean'                               },
		'LimitedEditingCapabilitiesSubmissions': { type: 'boolean'                               },
	};


	[Symbol.iterator] () {
		let snapshot = this.getQuestions();
		let {length} = snapshot;
		let index = 0;

		return {

			next () {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			}

		};
	}


	get isAutoGradable () {
		for (let question of this) {
			if (!question.isAutoGradable) { return false; }
		}

		return true;
	}


	getAssociations () {
		return this.fetchLinkParsed('Lessons');
	}


	getPlacementProvider (scope, accepts) {
		return new PlacementProvider(scope, this, accepts);
	}


	getAutoGradableConflicts () {
		const conflicts = [];
		const questions = this.questions || [];

		for (let question of questions) {
			if (!question.isAutoGradable) {
				conflicts.push({
					index: questions.indexOf(question),
					reason: question.getAutoGradableConflicts(),
					question
				});
			}
		}

		return conflicts;
	}


	/**
	 * Is the question order set to be randomized.
	 * @property {boolean} isRandomized
	 */


	/**
	 * Are the question parts set to use the Randomized Part variant?
	 * @property {boolean} isPartTypeRandomized.
	 */


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
	 * @returns {number} max or null if unrestricted
	 */
	getQuestionLimit () {
		return this.draw;
	}


	getQuestion (id) {
		return (this.questions || []).reduce((found, q) => found || (q.getID() === id && q), null);
	}


	getQuestions () {
		return (this.questions || []).slice();
	}


	getQuestionCount () {
		return (this.questions || []).length;
	}


	getSubmission () {
		return QuestionSetSubmission.build(this);
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
	 * @returns {Promise} The promise of the work being done.
	 */
	toggleRandomized (parts) {
		const cap = (s) => s[0].toUpperCase() + s.substr(1);
		const rel = 'randomize' + (parts ? 'PartsType' : '');

		let link = this.hasLink(cap(rel)) ? cap(rel) : cap(`un${rel}`);
		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links', 'Randomized', 'RandomizedPartsType', 'draw')))
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
		return this.save({
			'draw': n
		});
	}
}

export default decorate(QuestionSet, {with: [
	model,
	mixin(SubmittableIdentity, Completable),
]});
