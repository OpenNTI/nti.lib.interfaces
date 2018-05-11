import {model, COMMON_PREFIX} from '../Registry';

import BaseCredit from './BaseCredit';

export default
@model
class CourseAwardedCredit extends BaseCredit {
	static MimeType = [
		COMMON_PREFIX + 'credit.courseawardedcredit'
	]

}
