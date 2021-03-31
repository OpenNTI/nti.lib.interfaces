import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class EnrollmentOptionContainer extends Base {
	static MimeType = [COMMON_PREFIX + 'courseware.enrollmentoptioncontainer'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'AvailableEnrollmentOptions': { type: 'model[]' },
		'Items':                      { type: 'model[]' },
		'ItemCount':                  { type: 'number'  }
	}
}

export default decorate(EnrollmentOptionContainer, { with: [model] });
