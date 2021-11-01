import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class EnrollmentOptionContainer extends Base {
	static MimeType = [COMMON_PREFIX + 'courseware.enrollmentoptioncontainer'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'AvailableEnrollmentOptions': { type: 'model[]' },
		'Items':                      { type: 'model[]' },
		'ItemCount':                  { type: 'number'  }
	};
}

Registry.register(EnrollmentOptionContainer);
