import Registry, {COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export class WebhookDeliveryAttemptRequest extends Base {
	static MimeType = COMMON_PREFIX + 'zapier.webhookdeliveryattemptrequest';

	static Fields = {
		...super.Fields,
		'headers': { type: 'object' },
		'body':    { type: 'string' },
	}

	constructor (service, parent, data) {
		super(service, parent, data);

		if (data?.body) {
			try {
				this.body = JSON.parse(data.body);
			}
			catch (e) {
				// don't care
			}
		}
	}
}

Registry.register(WebhookDeliveryAttemptRequest);
Registry.alias(WebhookDeliveryAttemptRequest.MimeType, 'WebhookDeliveryAttemptRequest');
