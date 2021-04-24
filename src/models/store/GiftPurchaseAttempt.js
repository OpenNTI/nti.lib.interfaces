import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import PurchaseAttempt from './PurchaseAttempt.js';

class GiftPurchaseAttempt extends PurchaseAttempt {
	static MimeType = COMMON_PREFIX + 'store.giftpurchaseattempt';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Receiver':     { type: 'string', name: 'receiver'     },
		'ReceiverName': { type: 'string', name: 'receiverName' },
		'Sender':       { type: 'string', name: 'sender'       },
		'SenderName':   { type: 'string', name: 'senderName'   },
		'To':           { type: 'string', name: 'to'           },
	}
}

export default decorate(GiftPurchaseAttempt, [model]);
