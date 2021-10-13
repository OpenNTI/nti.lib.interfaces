import Base from '../Base.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';

export default class UserSegment extends Base {
	static MimeType = COMMON_PREFIX + 'segments.usersegment';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'title': {type: 'string'}
	}

	isSegment = true;
}

Registry.register(UserSegment);
