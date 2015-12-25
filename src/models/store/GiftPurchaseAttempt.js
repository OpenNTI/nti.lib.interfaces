import PurchaseAttempt from './PurchaseAttempt';
// import { Parser as parse } from '../../constants';

const TakeOver = Symbol.for('TakeOver');

export default class GiftPurchaseAttempt extends PurchaseAttempt {
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
