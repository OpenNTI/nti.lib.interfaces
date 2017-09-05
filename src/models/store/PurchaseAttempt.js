import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class PurchaseAttempt extends Base {
	static MimeType = COMMON_PREFIX + 'store.purchaseattempt'

	static Fields = {
		...Base.Fields,
		'ChargeID':       { type: 'string', name: 'chargeId' },
		'Description':    { type: 'string', name: 'description' },
		'DeliveryDate':   { type: 'date' },
		'EndTime':        { type: 'date' },
		// 'Error':          { type: 'string', name: 'error' },
		// 'Message':        { type: 'string', name: 'message' },
		'Order':          { type: 'model',  name: 'order' },
		'Pricing':        { type: 'model',  name: 'pricing' },
		'Processor':      { type: 'string', name: 'processor' },
		'RedemptionCode': { type: 'string', name: 'redemptionCode' },
		'StartTime':      { type: 'date' },
		'State':          { type: 'string', name: 'state' },
		'Synced':         { type: 'string', name: 'synced' },
		'TokenID':        { type: 'string', name: 'tokenId' },
		'TransactionID':  { type: 'string', name: 'transactionID' },
	}

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
