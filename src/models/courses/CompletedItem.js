import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CompletedItem extends Base {
	static MimeType = [
		COMMON_PREFIX + 'completion.completeditem',
	]

	static Fields = {
		...Base.Fields,
		'CompletedDate':       { type: 'date'                       },
		'Success':         	   { type: 'boolean'                    },
	}

	getCompletedDate () { } //implemented by CompletedDate date field.
}

