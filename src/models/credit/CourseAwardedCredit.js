import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import BaseCredit from './BaseCredit.js';

class CourseAwardedCredit extends BaseCredit {
	static MimeType = [COMMON_PREFIX + 'credit.courseawardedcredit'];
}

export default decorate(CourseAwardedCredit, [model]);
