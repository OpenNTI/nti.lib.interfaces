import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

export class EventAttendanceRecord extends Base {
	static MimeType = COMMON_PREFIX + 'calendar.usercalendareventattendance';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'registrationTime': { type: 'date' },
		'User':             { type: 'model' }
	};
}

Registry.register(EventAttendanceRecord);
