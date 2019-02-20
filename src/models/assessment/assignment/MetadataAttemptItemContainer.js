import Base from '../../Base';
import { model, COMMON_PREFIX } from '../../Registry';

export default
@model
class MetadataAttemptItemContainer extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmentattemptmetadataitemcontainer'

	static Fields = {
		'Items': {type: 'model[]'}
	}

	getLatest () {
		return this.Items ? this.Items[this.Items.length - 1] : null;
	}
}
