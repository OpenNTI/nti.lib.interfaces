import {decorate} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import {Mixin as ContentTreeMixin} from '../../../content-tree';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

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

export default decorate(VideoRoll, {with:[
	model,
	mixin(ContentTreeMixin),
]});
