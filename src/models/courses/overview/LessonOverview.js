import { Mixin as ContentTree } from '../../../content-tree/index.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class LessonOverview extends ContentTree(Base) {
	static MimeType = COMMON_PREFIX + 'ntilessonoverview';

	// prettier-ignore
	static Fields = {
		...super.Fields,
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

Registry.register(LessonOverview);
