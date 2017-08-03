import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class OverviewGroup extends Base {
	static MimeType = COMMON_PREFIX + 'nticourseoverviewgroup'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Items');
	}


	getRefsTo (item) {
		const itemID = item.NTIID || item;

		return (this.Items || []).filter((ref) => ref['Target-NTIID'] === itemID);
	}
}
