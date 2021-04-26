import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class PricingResults extends Base {
	static MimeType = COMMON_PREFIX + 'store.pricingresults';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Currency':                   { type: 'string',  name: 'currency' },
		'Items':                      { type: 'model[]'                   },
		'TotalPurchasePrice':         { type: 'number'                    },
		'TotalNonDiscountedPrice':    { type: 'number'                    },
	}
}

Registry.register(PricingResults);
