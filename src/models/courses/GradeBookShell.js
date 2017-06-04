import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class GradeBookShell extends Base {
	static MimeType = COMMON_PREFIX + 'gradebookshell'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
