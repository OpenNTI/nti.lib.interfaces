import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';
import Completable from '../../../mixins/Completable.js';

class WebinarAsset extends Base {
	static MimeType = COMMON_PREFIX + 'webinarasset';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'description':  { type: 'string' },
		'title':        { type: 'string' },
		'webinar':      { type: 'model'  },
		'organizerKey': { type: 'string' },
		'icon':         { type: 'string' }
	}
}

export default decorate(WebinarAsset, { with: [model, mixin(Completable)] });
