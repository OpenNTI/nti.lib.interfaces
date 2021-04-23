import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class CreditDefinition extends Base {
	static MimeType = [COMMON_PREFIX + 'credit.creditdefinition'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'credit_type':  { type: 'string', name: 'type' },
		'credit_units': { type: 'string', name: 'unit' }
	}
}

export default decorate(CreditDefinition, [model]);
