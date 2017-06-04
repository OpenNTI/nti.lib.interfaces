import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

@model
export default class LeasonOverview extends Base {
	static MimeType = COMMON_PREFIX + 'ntilessonoverview'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Items');
	}


	getRefsTo (item) {
		return this.Items.reduce((acc, group) => {
			return acc.concat(group && group.getRefsTo ? group.getRefsTo(item) : []);
		}, []);
	}
}
