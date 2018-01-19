import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class InstructorReport extends Base {
	static MimeType = COMMON_PREFIX + 'courseware_reports.basereport'

	static Fields = {
		'description':     {type: 'string'},
		'title':           {type: 'string'},
		'supported_types': {type: 'string[]', name: 'supportedTypes'},
		'rel':             {type: 'string'}
	}
}
