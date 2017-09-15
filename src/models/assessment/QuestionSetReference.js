import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class QuestionSetReference extends Base {
	static MimeType = COMMON_PREFIX + 'questionsetref'
}
