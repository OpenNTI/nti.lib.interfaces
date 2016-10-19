import Base from '../../Base';
import {Parser as parse} from '../../../constants';

export default class OverviewGroup extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Items');
	}


	getRefsTo (item) {
		const itemID = item.NTIID || item;

		return (this.Items || []).filter((ref) => ref['Target-NTIID'] === itemID);
	}
}
