import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class ProfessionalPosition extends Base {
	static MimeType = COMMON_PREFIX + 'profile.professionalposition'

	static Fields = {
		...Base.Fields,
		'companyName': { type: 'string', required: true },
		'description': { type: 'string'                 },
		'endYear':     { type: 'number'                 },
		'startYear':   { type: 'number'                 },
		'title':       { type: 'string'                 },
	}
}
