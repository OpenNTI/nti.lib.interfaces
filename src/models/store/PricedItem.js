import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class PricedItem extends Base {
	static MimeType = COMMON_PREFIX + 'store.priceditem'

	static Fields = {
		...Base.Fields,
		'Amount':        { type: 'number', name: 'amount'        },
		'Currency':      { type: 'string', name: 'currency'      },
		'Provider':      { type: 'string', name: 'provider'      },
		'PurchasePrice': { type: 'number', name: 'purchasePrice' },
		'Quantity':      { type: 'number', name: 'quantity'      },
	}
}

export default decorate(PricedItem, {with:[model]});
