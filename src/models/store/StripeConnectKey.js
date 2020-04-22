import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class StripeConnectKey extends Base {
	static MimeType = [
		COMMON_PREFIX + 'store.stripeconnectkey',
		COMMON_PREFIX + 'store.persistentstripeconnectkey'
	]

	static Fields = {
		...Base.Fields,
		'Alias':        { type: 'string'  },
		'LiveMode':     { type: 'boolean' },
		'PublicKey':    { type: 'string'  },
		'StripeUserID': { type: 'string'  },
	}
}
