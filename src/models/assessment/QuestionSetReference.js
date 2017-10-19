import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class QuestionSetReference extends Base {
	static MimeType = COMMON_PREFIX + 'questionsetref'

	static Fields = {
		...Base.Fields,
		'Target-NTIID':   { type: 'string' },
		'question-count': { type: 'number' },
		'label':          { type: 'string' }
	}
}
