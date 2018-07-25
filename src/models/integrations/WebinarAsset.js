import {mixin} from '@nti/lib-decorators';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';
import Completable from '../../mixins/Completable';

export default
@model
@mixin(Completable)
class WebinarAsset extends Base {
	static MimeType = COMMON_PREFIX + 'webinarasset'

	static Fields = {
		...Base.Fields,
		'description':  { type: 'string' },
		'title':        { type: 'string' },
		'webinar':      { type: 'model'  },
		'organizerKey': { type: 'string' },
		'icon':         { type: 'string' }
	}
}
