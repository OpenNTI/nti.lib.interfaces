import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import BaseCredit from './BaseCredit';

class CourseAwardableCredit extends BaseCredit {
	static MimeType = [COMMON_PREFIX + 'credit.courseawardablecredit'];
}

export default decorate(CourseAwardableCredit, { with: [model] });
