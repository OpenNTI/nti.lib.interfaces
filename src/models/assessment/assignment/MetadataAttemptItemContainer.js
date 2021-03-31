import { decorate } from '@nti/lib-commons';

import Base from '../../Base.js';
import { model, COMMON_PREFIX } from '../../Registry.js';

class MetadataAttemptItemContainer extends Base {
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

export default decorate(MetadataAttemptItemContainer, { with: [model] });
