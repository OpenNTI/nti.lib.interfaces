import PlacementProvider from '../../authoring/placement/providers/Question.js';
import { mixin as HasContent } from '../../mixins/HasContent.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

import QuestionIdentity from './mixins/QuestionIdentity.js';
import SubmittableIdentity from './mixins/SubmittableIdentity.js';
import Part from './Part.js';
import QuestionSet from './QuestionSet.js';
import QuestionSubmission from './QuestionSubmission.js';

const Individual = Symbol('Individual');

export default class Question extends HasContent(
	SubmittableIdentity(QuestionIdentity(Base))
) {
	static MimeType = [
		COMMON_PREFIX + 'question',
		COMMON_PREFIX + 'naquestion',
		COMMON_PREFIX + 'naquestionfillintheblankwordbank',
		COMMON_PREFIX + 'assessment.fillintheblankwithwordbankquestion',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'content':                  { type: 'string',  content: true    },
		'parts':                    { type: 'model[]', defaultValue: [] },
		'wordbank':                 { type: 'model'                     },
		'AssessmentContainerCount': { type: 'number'                    },
		'ContentRoot':              { type: 'string'                    },
		'containerId':              { type: 'string'                    },
		'IsAvailable':              { type: 'boolean'                   },
	};

	[Symbol.iterator]() {
		let snapshot = this.parts.slice();
		let { length } = snapshot;
		let index = 0;

		return {
			next() {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			},
		};
	}

	get individual() {
		let result = this[Individual];
		if (!Object.prototype.hasOwnProperty.call(this, Individual)) {
			result = !this.parent({ test: p => p instanceof QuestionSet });
			this[Individual] = result; //stop computing
		}
		return result;
	}

	get isAutoGradable() {
		for (let part of this) {
			if (!part.AutoGradable) {
				return false;
			}
		}

		return true;
	}

	get associationCount() {
		return this.AssessmentContainerCount;
	}

	getAssociations() {
		return this.fetchLink('Assessments');
	}

	getPlacementProvider(scope, accepts) {
		return new PlacementProvider(scope, this, accepts);
	}

	getAutoGradableConflicts() {
		const conflicts = [];
		for (let part of this.parts) {
			if (!part.AutoGradable) {
				conflicts.push({
					index: this.parts.indexOf(part),
					part,
				});
			}
		}

		return conflicts;
	}

	getPart(index) {
		return (this.parts || [])[index];
	}

	getVideos() {
		//Eeewww...
		let all = Part.prototype.getVideos.call(this);

		for (let p of this.parts) {
			all.push.apply(all, p.getVideos());
		}
		return all;
	}

	getSubmission() {
		return QuestionSubmission.build(this);
	}

	loadPreviousSubmission() {
		// let dataProvider = this.parent('getUserDataLastOfType');
		// if (!dataProvider) {
		// 	return Promise.reject('Nothing to do');
		// }
		//
		// return dataProvider.getUserDataLastOfType(SUBMITTED_TYPE);
		return Promise.reject('Individual Question history not implemented');
	}

	isAnswered(questionSubmission) {
		let items = this.parts || [];
		let expect = items.length;
		let { parts } = questionSubmission;

		return (
			items.filter((p, i) => p && p.isAnswered && p.isAnswered(parts[i]))
				.length === expect
		);
	}
}

Registry.register(Question);
