import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import BaseCredit from './BaseCredit';

class CourseAwardedCredit extends BaseCredit {
	static MimeType = [
		COMMON_PREFIX + 'credit.courseawardedcredit'
	]

}

export default decorate(CourseAwardedCredit, {with:[model]});
