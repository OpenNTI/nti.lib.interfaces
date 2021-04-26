import Registry, { COMMON_PREFIX } from '../Registry.js';

import BaseCredit from './BaseCredit.js';

export default class CourseAwardedCredit extends BaseCredit {
	static MimeType = [COMMON_PREFIX + 'credit.courseawardedcredit'];
}

Registry.register(CourseAwardedCredit);
