import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

@model
export default class AssignmentReference extends Base {
	static MimeType = COMMON_PREFIX + 'assignmentref'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
