import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class BaseCredit extends Base {
	static MimeType = [COMMON_PREFIX + 'credit.basecredit'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'amount':            { type: 'number'                          },
		'title':             { type: 'string'                          },
		'description':       { type: 'string'                          },
		'credit_definition': { type: 'model', name: 'creditDefinition' },
		'issuer':            { type: 'string'                          },
		'awarded_date':      { type: 'date',                           }, //becomes getAwardedDate
		'user':              { type: 'model',                          }
	}

	getAwardedDate() {} //implemented by awarded_date date field.

	getFormattedAmount() {
		const { locale } = new Intl.NumberFormat().resolvedOptions();
		const formatter = new Intl.NumberFormat(locale, {
			minimumFractionDigits: this.creditDefinition.precision,
			maximumFractionDigits: this.creditDefinition.precision,
		});

		return formatter.format(this.amount || 0);
	}
}

Registry.register(BaseCredit);
