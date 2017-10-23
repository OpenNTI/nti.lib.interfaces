import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentReference extends Base {
	static MimeType = COMMON_PREFIX + 'assignmentref'

	static Fields = {
		...Base.Fields,
		'Target-NTIID':  { type: 'string' },
		'label':         { type: 'string' }
	}
}
