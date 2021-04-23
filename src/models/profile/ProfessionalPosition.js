import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class ProfessionalPosition extends Base {
	static MimeType = COMMON_PREFIX + 'profile.professionalposition';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'companyName': { type: 'string', required: true },
		'description': { type: 'string'                 },
		'endYear':     { type: 'number'                 },
		'startYear':   { type: 'number'                 },
		'title':       { type: 'string'                 },
	}
}

export default decorate(ProfessionalPosition, [model]);
