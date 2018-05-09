import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class UserAwardedCredit extends Base {
	static MimeType = [
		COMMON_PREFIX + 'credit.userawardedcredit'
	]

	static Fields = {
		...Base.Fields,
		'amount':            { type: 'number'                         },
		'title':             { type: 'string'                         },
		'description':       { type: 'string'                         },
		'credit_definition': { type: 'model', name: 'creditDefinition'}
	}

}
