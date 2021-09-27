import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class CreditDefinition extends Base {
	static MimeType = [COMMON_PREFIX + 'credit.creditdefinition'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'credit_precision': { type: 'number', name: 'precision' },
		'credit_type':      { type: 'string', name: 'type' },
		'credit_units':     { type: 'string', name: 'unit' },
	}
}

Registry.register(CreditDefinition);
