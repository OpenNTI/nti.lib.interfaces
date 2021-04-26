import Registry, { COMMON_PREFIX } from '../Registry.js';

import BaseCredit from './BaseCredit.js';

export default class CourseAwardableCredit extends BaseCredit {
	static MimeType = [COMMON_PREFIX + 'credit.courseawardablecredit'];
}

Registry.register(CourseAwardableCredit);
