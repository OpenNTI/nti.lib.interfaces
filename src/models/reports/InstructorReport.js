import {model, COMMON_PREFIX} from '../Registry';

import Base from './BaseReport';

export default
@model
class InstructorReport extends Base {
	static MimeType = COMMON_PREFIX + 'courseware_reports.instructorreport'
}
