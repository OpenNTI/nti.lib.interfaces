import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class OverviewGroup extends Base {
	static MimeType = COMMON_PREFIX + 'nticourseoverviewgroup'

	static Fields = {
		...Base.Fields,
		'Items': { type: 'model[]' },
	}


	getRefsTo (item) {
		const itemID = item.NTIID || item;

		return (this.Items || []).filter((ref) => ref['Target-NTIID'] === itemID);
	}
}
