import Base from '../Base';
import {
	DateFields,
	Parser as parse } from '../../constants';

const TakeOver = Symbol.for('TakeOver');


export default class PurchaseAttempt extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		this[parse]('Order');
		this[parse]('Pricing');

		rename('ChargeID', 'chargeId');
		rename('TokenID', 'tokenId');
		rename('TransactionID', 'transactionID');
		rename('RedemptionCode', 'redemptionCode');

		rename('Description', 'description');

		// rename('Error', 'error');
		// rename('Message', 'message');

		rename('Order', 'order');
		rename('Pricing', 'pricing');
		rename('Processor', 'processor');
		rename('State', 'state');
		rename('Synced', 'synced');
	}


	[DateFields] () {
		return super[DateFields]().concat([
			'DeliveryDate',
			'CreatedTime',
			'EndTime',
			'StartTime'
		]);
	}
}
