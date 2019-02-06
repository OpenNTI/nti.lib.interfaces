import Base from '../Base';
import {model, COMMON_PREFIX} from '../Registry';

export default
@model
class RosterRecord extends Base {
	static MimeType = COMMON_PREFIX + 'courses.rosterenrollmentsummary'

	static Fields = {
		...Base.Fields,
		'CourseProgress':         { type: 'model', name: 'courseProgress'    },
		'LegacyEnrollmentStatus': { type: 'string', name: 'enrollmentStatus' },
		'RealEnrollmentStatus':   { type: '*', name: 'status'                },
		'Reports':                { type: 'model', name: 'reports'           },
		'Username':               { type: '*', name: 'username'              },
		'UserProfile':            { type: 'model', name: 'user'              },
	}


	constructor (service, data) {
		super(service, null, data);
	}


	toString () {
		return `${this.username}: ${this.user.displayName} (${this.user.displayType}) - enrolled: ${this.enrollmentStatus}`;
	}
}
