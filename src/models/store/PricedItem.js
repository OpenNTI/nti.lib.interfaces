import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class PricedItem extends Base {
	static MimeType = COMMON_PREFIX + 'store.priceditem';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Amount':        { type: 'number', name: 'amount'        },
		'Currency':      { type: 'string', name: 'currency'      },
		'Provider':      { type: 'string', name: 'provider'      },
		'PurchasePrice': { type: 'number', name: 'purchasePrice' },
		'Quantity':      { type: 'number', name: 'quantity'      },
	}
}

Registry.register(PricedItem);
