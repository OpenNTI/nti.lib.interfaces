import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class EnrollmentOptionContainer extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware.enrollmentoptioncontainer',
	]

	static Fields = {
		...Base.Fields,
		'AvailableEnrollmentOptions': { type: 'model[]' },
		'Items':                      { type: 'model[]' },
		'ItemCount':                  { type: 'number'  }
	}
}

export default decorate(EnrollmentOptionContainer, {with:[model]});
