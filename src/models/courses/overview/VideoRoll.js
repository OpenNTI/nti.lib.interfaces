import {mixin} from '@nti/lib-decorators';

import {Mixin as ContentTreeMixin} from '../../../content-tree';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
@mixin(ContentTreeMixin)
class VideoRoll extends Base {
	static MimeType = COMMON_PREFIX + 'videoroll'

	static Fields = {
		...Base.Fields,
		'Items': { type: 'model[]' }
	}

	getContentTreeChildrenSource () {
		return this.Items;
	}
}
