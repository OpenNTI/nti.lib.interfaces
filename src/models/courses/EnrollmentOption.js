import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class EnrollmentOption extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware.enrollmentoption',
		COMMON_PREFIX + 'courseware.openenrollmentoption',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Enabled':         { type: 'boolean', name: 'enabled'   },
		'IsAvailable':     { type: 'boolean', name: 'available' },
		'IsEnrolled':      { type: 'boolean', name: 'enrolled'  },
		'IsSeatAvailable': { type: 'boolean', name: 'seatAvailable' }
	}
}

Registry.register(EnrollmentOption);
