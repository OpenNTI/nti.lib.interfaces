import Registry, {COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export class PersistentWebhookDeliveryAttempt extends Base {
	static MimeType = COMMON_PREFIX + 'zapier.persistentwebhookdeliveryattempt';

	static Fields = {
		...super.Fields,
		'message': { type: 'string' },
		'status':  { type: 'string' },
	}
}

Registry.register(PersistentWebhookDeliveryAttempt);
Registry.alias(PersistentWebhookDeliveryAttempt.MimeType, 'PersistentWebhookDeliveryAttempt');
