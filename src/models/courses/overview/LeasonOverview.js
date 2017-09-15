import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class LeasonOverview extends Base {
	static MimeType = COMMON_PREFIX + 'ntilessonoverview'

	static Fields = {
		...Base.Fields,
		'Items': { type: 'model[]' },
	}


	getRefsTo (item) {
		return this.Items.reduce((acc, group) =>
			acc.concat(group && group.getRefsTo ? group.getRefsTo(item) : []), []);
	}
}
