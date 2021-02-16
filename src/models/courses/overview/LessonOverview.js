import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Mixin as ContentTreeMixin } from '../../../content-tree';
import { model, COMMON_PREFIX } from '../../Registry';
import Base from '../../Base';

class LessonOverview extends Base {
	static MimeType = COMMON_PREFIX + 'ntilessonoverview';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Items': { type: 'model[]' },
		'title': { type: 'string'  }
	}

	getRefsTo(item) {
		return this.Items.reduce(
			(acc, group) =>
				acc.concat(
					group && group.getRefsTo ? group.getRefsTo(item) : []
				),
			[]
		);
	}

	getContentTreeChildrenSource() {
		return this.Items;
	}
}

export default decorate(LessonOverview, {
	with: [model, mixin(ContentTreeMixin)],
});
