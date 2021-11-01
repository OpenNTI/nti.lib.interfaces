import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class ProfessionalPosition extends Base {
	static MimeType = COMMON_PREFIX + 'profile.professionalposition';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'companyName': { type: 'string', required: true },
		'description': { type: 'string'                 },
		'endYear':     { type: 'number'                 },
		'startYear':   { type: 'number'                 },
		'title':       { type: 'string'                 },
	};
}

Registry.register(ProfessionalPosition);
