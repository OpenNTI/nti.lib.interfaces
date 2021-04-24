import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Mixin as ContentTreeMixin } from '../../../content-tree/index.js';
import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class VideoRoll extends Base {
	static MimeType = COMMON_PREFIX + 'videoroll';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items': { type: 'model[]' }
	}

	getContentTreeChildrenSource() {
		return this.Items;
	}
}

export default decorate(VideoRoll, [model, mixin(ContentTreeMixin)]);
