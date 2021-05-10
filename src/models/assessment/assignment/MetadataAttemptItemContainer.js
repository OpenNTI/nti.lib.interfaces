import Base from '../../Base.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';

export default class MetadataAttemptItemContainer extends Base {
	static MimeType =
		COMMON_PREFIX +
		'assessment.userscourseassignmentattemptmetadataitemcontainer';

	// prettier-ignore
	static Fields = {
		'Items': {type: 'model[]'}
	}

	getLatest() {
		return this.Items ? this.Items[this.Items.length - 1] : null;
	}
}

Registry.register(MetadataAttemptItemContainer);
