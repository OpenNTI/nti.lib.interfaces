import Base from '../../Base';
import {
	DateFields,
	Parser as parse
} from '../../../CommonSymbols';
import pluck from '../../../utils/pluck';

export default class AssignmentHistoryCollection extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		let {Items: items = {}} = this;

		for(let key of Object.keys(items)) {
			items[key] = this[parse](items[key]);
		}
	}


	[DateFields] () {
		return super[DateFields]().concat(['lastViewed']);
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


	markSeen () {
		return this.putToLink('lastViewed', new Date().getTime() / 1000)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links', 'lastViewed')))
			.then(() => this.onChange('lastViewed'));
	}
}
