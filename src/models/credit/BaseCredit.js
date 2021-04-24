import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class BaseCredit extends Base {
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
}

export default decorate(BaseCredit, [model]);
