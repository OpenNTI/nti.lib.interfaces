import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';


export default
@model
class PricingResults extends Base {
	static MimeType = COMMON_PREFIX + 'store.pricingresults'

	static Fields = {
		...Base.Fields,
		'Currency':                   { type: 'number',  name: 'currency' },
		'Items':                      { type: 'model[]'                   },
		'TotalPurchasePrice':         { type: 'number'                    },
		'TotalNonDiscountedPrice':    { type: 'number'                    },
	}
}
