import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class BaseCredit extends Base {
	static MimeType = [COMMON_PREFIX + 'credit.basecredit'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'amount':            { type: 'number'                          },
		'title':             { type: 'string'                          },
		'description':       { type: 'string'                          },
		'credit_definition': { type: 'model', name: 'creditDefinition' },
		'issuer':            { type: 'string'                          },
		'awarded_date':      { type: 'date',                           }, //becomes getAwardedDate
		'user':              { type: 'model',                          }
	}

	getAwardedDate() {} //implemented by awarded_date date field.
}

export default decorate(BaseCredit, { with: [model] });
