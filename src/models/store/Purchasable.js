import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

const StripeConnectKey = Symbol('StripeConnectKey');

class Purchasable extends Base {
	static MimeType = COMMON_PREFIX + 'store.purchasable';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Author':           { type: 'string',  name: 'author'         },
		'Activated':        { type: 'boolean', name: 'activated'      },
		'Amount':           { type: 'number',  name: 'amount'         },
		'BulkPurchase':     { type: 'boolean', name: 'bulkPurchase'   },
		'Currency':         { type: 'string',  name: 'currency'       },
		'Discountable':     { type: 'boolean', name: 'discountable'   },
		'Fee':              { type: 'number',  name: 'fee'            },
		'Giftable':         { type: 'boolean', name: 'giftable'       },
		'IsPurchasable':    { type: 'boolean', name: 'enabled'        },
		'Name':             { type: 'string',  name: 'name'           },
		'Provider':         { type: 'string',  name: 'provider'       },
		'Redeemable':       { type: 'boolean', name: 'redeemable'     },
		'Title':            { type: 'string',  name: 'title'          },
		'StripeConnectKey': { type: 'model',   name: StripeConnectKey },
		'VendorInfo':       { type: 'model',   name: 'vendorInfo'     },
	}

	getStripeConnectKey() {
		return this[StripeConnectKey];
	}
}

export default decorate(Purchasable, [model]);
