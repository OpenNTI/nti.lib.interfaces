import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class CreditDefinition extends Base {
	static MimeType = [
		COMMON_PREFIX + 'credit.creditdefinition'
	]

	static Fields = {
		...Base.Fields,
		'credit_type':  { type: 'string', name: 'type' },
		'credit_units': { type: 'string', name: 'unit' }
	}

}

export default decorate(CreditDefinition, {with:[model]});
