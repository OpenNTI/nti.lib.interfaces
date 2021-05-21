import { mixin as ContentTree } from '../../../content-tree/index.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class VideoRoll extends ContentTree(Base) {
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

Registry.register(VideoRoll);
