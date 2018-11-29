import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CalendarEventRef extends Base {
	static MimeType = `${COMMON_PREFIX}nticalendareventref`

	static Fields = {
		...Base.Fields,
		'CalendarEvent':        { type: 'model'  }
	}
}
