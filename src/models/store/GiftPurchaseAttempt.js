// import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import PurchaseAttempt from './PurchaseAttempt';

const TakeOver = Symbol.for('TakeOver');

@model
export default class GiftPurchaseAttempt extends PurchaseAttempt {
	static MimeType = COMMON_PREFIX + 'store.giftpurchaseattempt'

	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		rename('Receiver', 'receiver');
		rename('ReceiverName', 'receiverName');

		rename('Sender', 'sender');
		rename('SenderName', 'senderName');

		rename('To', 'to');
	}
}
