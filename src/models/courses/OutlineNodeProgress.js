import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class OutlineNodeProgress extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseoutlinenodeprogress',
		COMMON_PREFIX + 'progresscontainer',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Items': { type: 'model{}' },
	}

	getProgress(ntiid) {
		return this.Items[ntiid];
	}
}

export default decorate(OutlineNodeProgress, [model]);
