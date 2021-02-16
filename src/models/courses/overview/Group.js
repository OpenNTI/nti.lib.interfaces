import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Mixin as ContentTreeMixin } from '../../../content-tree';
import { model, COMMON_PREFIX } from '../../Registry';
import Base from '../../Base';

class OverviewGroup extends Base {
	static MimeType = COMMON_PREFIX + 'nticourseoverviewgroup';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
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

export default decorate(OverviewGroup, {
	with: [model, mixin(ContentTreeMixin)],
});
