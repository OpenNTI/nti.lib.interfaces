import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class PricingResults extends Base {
	static MimeType = COMMON_PREFIX + 'store.pricingresults';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Currency':                   { type: 'string',  name: 'currency' },
		'Items':                      { type: 'model[]'                   },
		'TotalPurchasePrice':         { type: 'number'                    },
		'TotalNonDiscountedPrice':    { type: 'number'                    },
	}
}

export default decorate(PricingResults, [model]);
