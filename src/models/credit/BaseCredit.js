import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

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
	};

	getAwardedDate() {} //implemented by awarded_date date field.

	getFormattedAmount({ unit = false, type = false } = {}) {
		const { creditDefinition: cd } = this;

		const result = cd.format(this.amount || 0);
		return [result, type && cd.type, unit && cd.unit]
			.filter(Boolean)
			.join(' ');
	}
}

Registry.register(BaseCredit);
