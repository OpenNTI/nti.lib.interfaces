import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class Solution extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.solution'
}
