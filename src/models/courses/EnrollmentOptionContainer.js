import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
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
