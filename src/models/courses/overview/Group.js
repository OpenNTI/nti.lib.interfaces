import {mixin} from '@nti/lib-decorators';

import {Mixin as ContentTreeMixin} from '../../../content-tree';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
@mixin(ContentTreeMixin)
class OverviewGroup extends Base {
	static MimeType = COMMON_PREFIX + 'nticourseoverviewgroup'

	static Fields = {
		...Base.Fields,
		'Items':       { type: 'model[]' },
		'accentColor': { type: 'string' },
		'title':       { type: 'string' }
	}


	getRefsTo (item) {
		const itemID = item.NTIID || item;

		return (this.Items || []).filter((ref) => ref['Target-NTIID'] === itemID);
	}

	getContentTreeChildrenSource () {
		return this.Items;
	}
}
