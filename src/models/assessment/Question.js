import Base from '../Base';
import {
	Parser as parse
} from '../../constants';

import HasContent from '../mixins/HasContent';

import Part from './Part';
import PlacementProvider from '../../authoring/placement/providers/Question';
import QuestionSet from './QuestionSet';
import QuestionSubmission from './QuestionSubmission';

const Individual = Symbol('Individual');

export default class Question extends Base {
	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, HasContent, {
			isSubmittable: true,
			isQuestion: true
		}, ...mixins);

		this[parse]('parts', []);
		this[parse]('wordbank');
	}


	[Symbol.iterator] () {
		let snapshot = this.parts.slice();
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



	get individual () {
		let result = this[Individual];
		if (!this.hasOwnProperty(Individual)) {
			result = !this.parent({test: p=>p instanceof QuestionSet});
			this[Individual] = result; //stop computing
		}
		return result;
	}


	get isAutoGradable () {
		for (let part of this) {
			if (!part.AutoGradable) { return false; }
		}

		return true;
	}


	getAssociations () {
		return this.fetchLinkParsed('Assessments');
	}


	getPlacementProvider (scope, accepts) {
		return new PlacementProvider(scope, this, accepts);
	}


	getAutoGradableConflicts () {
		const conflicts = [];
		for (let part of this.parts) {
			if (!part.AutoGradable) {
				conflicts.push({
					index: this.parts.indexOf(part),
					part
				});
			}
		}

		return conflicts;
	}


	getPart (index) {
		return (this.parts || [])[index];
	}


	getVideos () {
		//Eeewww...
		let all = Part.prototype.getVideos.call(this);

		for(let p of this.parts) {
			all.push.apply(all, p.getVideos());
		}
		return all;
	}


	getSubmission () {
		return QuestionSubmission.build(this);
	}


	loadPreviousSubmission () {
		// let dataProvider = this.parent('getUserDataLastOfType');
		// if (!dataProvider) {
		// 	return Promise.reject('Nothing to do');
		// }
		//
		// return dataProvider.getUserDataLastOfType(SUBMITTED_TYPE);
		return Promise.reject('Individual Question history not implemented');
	}


	isAnswered (questionSubmission) {
		let items = this.parts || [];
		let expect = items.length;
		let {parts} = questionSubmission;

		return items.filter((p, i)=> p && p.isAnswered && p.isAnswered(parts[i])).length === expect;
	}

}
