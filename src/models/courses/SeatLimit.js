import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class CourseSeatLimit extends Base {
	static MimeType = COMMON_PREFIX + 'courses.seatlimit';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		max_seats:  { type: 'number', name: 'MaxSeats'  },
		used_seats: { type: 'number', name: 'UsedSeats' },
	};
}

Registry.register(CourseSeatLimit);
