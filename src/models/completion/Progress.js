import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class Progress extends Base {
	static MimeType = COMMON_PREFIX + 'completion.progress'

	static Fields = {
		'Completed':           { type: 'boolean' },
		'CompletedDate':       { type: 'date'    },
		'HasProgress':         { type: 'boolean' },
		'MaxPossibleProgress': { type: 'number'  },
	}

	getCompletedDate () {} //implemented by CompletedDate date field.
}
