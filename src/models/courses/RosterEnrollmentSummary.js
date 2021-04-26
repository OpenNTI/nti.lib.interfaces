import Base from '../Base.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';

export default class RosterRecord extends Base {
	static MimeType = COMMON_PREFIX + 'courses.rosterenrollmentsummary';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'CourseProgress':         { type: 'model', name: 'courseProgress'    },
		'LegacyEnrollmentStatus': { type: 'string', name: 'enrollmentStatus' },
		'RealEnrollmentStatus':   { type: '*', name: 'status'                },
		'Reports':                { type: 'model', name: 'reports'           },
		'Username':               { type: '*', name: 'username'              },
		'UserProfile':            { type: 'model', name: 'user'              },
	}

	constructor(service, data) {
		super(service, null, data);
	}

	toString() {
		return `${this.username}: ${this.user.displayName} (${this.user.displayType}) - enrolled: ${this.enrollmentStatus}`;
	}
}

Registry.register(RosterRecord);
