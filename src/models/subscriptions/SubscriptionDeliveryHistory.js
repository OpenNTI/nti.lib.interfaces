import Registry, {COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export class SubscriptionDeliveryHistory extends Base {
	static MimeType = COMMON_PREFIX + 'zapier.subscriptiondeliveryhistory';

	static Fields = {
		...super.Fields,
		'Items': { type: 'model[]' }
	}

}

Registry.register(SubscriptionDeliveryHistory);
