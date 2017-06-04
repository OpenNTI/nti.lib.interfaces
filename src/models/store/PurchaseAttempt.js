import {DateFields, Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');

@model
export default class PurchaseAttempt extends Base {
	static MimeType = COMMON_PREFIX + 'store.purchaseattempt'

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
