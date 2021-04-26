import Registry, { COMMON_PREFIX } from '../Registry.js';

import Base from './BaseReport.js';

export default class InstructorReport extends Base {
	static MimeType = COMMON_PREFIX + 'courseware_reports.instructorreport';
}

Registry.register(InstructorReport);
