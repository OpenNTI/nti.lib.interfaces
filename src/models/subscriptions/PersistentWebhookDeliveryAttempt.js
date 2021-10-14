import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export class PersistentWebhookDeliveryAttempt extends Base {
	static MimeType = COMMON_PREFIX + 'webhooks.webhookdeliveryattempt';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		message: { type: 'string' },
		status:  { type: 'string' },
	};

	isWebhookDeliveryAttempt = true;
}

Registry.register(PersistentWebhookDeliveryAttempt);
