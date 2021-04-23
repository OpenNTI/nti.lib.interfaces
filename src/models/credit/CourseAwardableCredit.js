import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import BaseCredit from './BaseCredit.js';

class CourseAwardableCredit extends BaseCredit {
	static MimeType = [COMMON_PREFIX + 'credit.courseawardablecredit'];
}

export default decorate(CourseAwardableCredit, [model]);
