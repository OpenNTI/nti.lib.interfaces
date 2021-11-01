import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';
import Completable from '../../../mixins/Completable.js';

export default class WebinarAsset extends Completable(Base) {
	static MimeType = COMMON_PREFIX + 'webinarasset';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'description':  { type: 'string' },
		'title':        { type: 'string' },
		'webinar':      { type: 'model'  },
		'organizerKey': { type: 'string' },
		'icon':         { type: 'string' }
	};
}

Registry.register(WebinarAsset);
