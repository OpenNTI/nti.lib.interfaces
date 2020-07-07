import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class StripeCoupon extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripecoupon'

	static Fields = {
		...Base.Fields,
		'AmountOff':      { type: 'number', name: 'amountOff'     },
		'Currency':       { type: 'string', name: 'currency'      },
		'Duration':       { type: 'string?', name: 'duration'      },
		'PercentOff':     { type: 'number', name: 'percentOff'    },
		'TimesRedeemed':  { type: 'number', name: 'timesRedeemed' },
	}


	getID () { return this.ID; }

	getCode () { return this.ID; }
}

export default decorate(StripeCoupon, {with:[model]});
