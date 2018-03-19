import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CompletionPolicy extends Base {
	static MimeType = [
		COMMON_PREFIX + 'completion.aggregatecompletionpolicy'
	]

	static Fields = {
		...Base.Fields,
		'percentage':        { type: 'number' }
	}
}
