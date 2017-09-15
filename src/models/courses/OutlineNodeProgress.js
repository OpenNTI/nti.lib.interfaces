import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class OutlineNodeProgress extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseoutlinenodeprogress',
		COMMON_PREFIX + 'progresscontainer',
	]

	static Fields = {
		...Base.Fields,
		'Items': { type: 'model{}' },
	}


	getProgress (ntiid) {
		return this.Items[ntiid];
	}
}
