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
}
