import { ArrayLike } from '../../mixins/ArrayLike.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export class CourseDiscussions extends ArrayLike(Base) {
	static MimeType = COMMON_PREFIX + 'courses.discussions';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items': { type: 'model[]' },
	};
}

Registry.register(CourseDiscussions);
