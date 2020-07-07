import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import PurchaseAttempt from './PurchaseAttempt';


class GiftPurchaseAttempt extends PurchaseAttempt {
	static MimeType = COMMON_PREFIX + 'store.giftpurchaseattempt'

	static Fields = {
		...PurchaseAttempt.Fields,
		'Receiver':     { type: 'string', name: 'receiver'     },
		'ReceiverName': { type: 'string', name: 'receiverName' },
		'Sender':       { type: 'string', name: 'sender'       },
		'SenderName':   { type: 'string', name: 'senderName'   },
		'To':           { type: 'string', name: 'to'           },
	}

}

export default decorate(GiftPurchaseAttempt, {with:[model]});
