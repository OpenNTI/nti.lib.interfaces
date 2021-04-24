import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class StripeConnectKey extends Base {
	static MimeType = [
		COMMON_PREFIX + 'store.stripeconnectkey',
		COMMON_PREFIX + 'store.persistentstripeconnectkey',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Alias':        { type: 'string'  },
		'LiveMode':     { type: 'boolean' },
		'PublicKey':    { type: 'string'  },
		'StripeUserID': { type: 'string'  },
	}
}

export default decorate(StripeConnectKey, [model]);
