import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class StripeCoupon extends Base {
	static MimeType = COMMON_PREFIX + 'store.stripecoupon';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'AmountOff':      { type: 'number', name: 'amountOff'     },
		'Currency':       { type: 'string', name: 'currency'      },
		'Duration':       { type: 'string?', name: 'duration'      },
		'PercentOff':     { type: 'number', name: 'percentOff'    },
		'TimesRedeemed':  { type: 'number', name: 'timesRedeemed' },
	};

	getID() {
		return this.ID;
	}

	getCode() {
		return this.ID;
	}
}

Registry.register(StripeCoupon);
