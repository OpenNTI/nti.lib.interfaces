import Registry, { COMMON_PREFIX } from '../Registry.js';

import { Segment } from './Segment.js';

export class UserSegment extends Segment {
	static MimeType = COMMON_PREFIX + 'segments.usersegment';
}

Registry.register(UserSegment);
