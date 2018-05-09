//application/vnd.nextthought.credit.creditdefinition

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
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
