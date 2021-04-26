import { Mixin as ContentTree } from '../../../content-tree/index.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class OverviewGroup extends ContentTree(Base) {
	static MimeType = COMMON_PREFIX + 'nticourseoverviewgroup';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items':       { type: 'model[]' },
		'accentColor': { type: 'string' },
		'title':       { type: 'string' }
	}

	getRefsTo(item) {
		const itemID = item.NTIID || item;

		return (this.Items || []).filter(ref => ref['Target-NTIID'] === itemID);
	}

	getContentTreeChildrenSource() {
		return this.Items;
	}
}

Registry.register(OverviewGroup);
