import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class GradeBookShell extends Base {
	static MimeType = COMMON_PREFIX + 'gradebookshell'
}
