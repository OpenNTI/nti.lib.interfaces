import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CatalogInstructorLegacyInfo extends Base {
	static MimeType = COMMON_PREFIX + 'courses.coursecataloginstructorlegacyinfo'

	static Fields = {
		...Base.Fields,
		'JobTitle':     { type: 'string' },
		'Name':         { type: 'string' },
		'Suffix':       { type: 'string' },
		'Title':        { type: 'string' },
		'defaultphoto': { type: 'string' },
		'username':     { type: 'string' },
	}
}
