import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

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

export default decorate(ProfessionalPosition, {with:[model]});
