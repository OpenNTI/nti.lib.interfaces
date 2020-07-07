import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class EnrollmentOption extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware.enrollmentoption',
		COMMON_PREFIX + 'courseware.openenrollmentoption',
	]

	static Fields = {
		...Base.Fields,
		'Enabled':     { type: 'boolean', name: 'enabled'   },
		'IsAvailable': { type: 'boolean', name: 'available' },
		'IsEnrolled':  { type: 'boolean', name: 'enrolled'  },
	}

}

export default decorate(EnrollmentOption, {with:[model]});
