import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export class WebhookDeliveryAttemptResponse extends Base {
	static MimeType = COMMON_PREFIX + 'webhooks.webhookdeliveryattemptresponse';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		content:     { type: 'string'                     },
		elapsed:     { type: 'string'                     },
		href:        { type: 'string'                     },
		reason:      { type: 'string'                     },
		headers:     { type: 'object'                     },
		status_code: { type: 'number', name: 'statusCode' },
	};
}

Registry.register(WebhookDeliveryAttemptResponse);
