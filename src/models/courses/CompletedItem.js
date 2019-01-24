import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';
import CompletionMetadata from '../completion/CompletionMetadata';

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
		'CompletionMetadata':  { type: CompletionMetadata           }
	}

	getCompletedDate () { } //implemented by CompletedDate date field.
}
