import { ArrayLike } from '../../mixins/ArrayLike.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class CourseInvitations extends ArrayLike(Base) {
	static MimeType = [COMMON_PREFIX + 'courseware.courseinvitations'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items':     { type: 'model[]' }
	};
}

Registry.register(CourseInvitations);
