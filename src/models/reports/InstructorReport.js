import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import Base from './BaseReport';

class InstructorReport extends Base {
	static MimeType = COMMON_PREFIX + 'courseware_reports.instructorreport'
}

export default decorate(InstructorReport, {with:[model]});
