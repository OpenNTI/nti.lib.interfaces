import Base from '../Base';
import {
	Parser as parse
} from '../../CommonSymbols';

export default class AssignmentHistoryCollection extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		let {Items: items = {}} = this;

		for(let key of Object.keys(items)) {
			items[key] = this[parse](items[key]);
		}
	}


	[Symbol.iterator] () {
		let snapshot = Object.values(this.Items);
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


	map (fn) {
		return Array.from(this).map(fn);
	}


	getItem (assignmentId) {
		return (this.Items || {})[assignmentId];
	}
}
