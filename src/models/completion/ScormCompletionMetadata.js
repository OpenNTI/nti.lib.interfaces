import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class SCORMCompletionMetadata extends Base {
	static MimeType = [
		COMMON_PREFIX + 'scormcompletionmetadata',
	]

	static Fields = {
		...Base.Fields,
		'ScormContentInfoNTIID': { type: 'string'   },
		'ScormContentInfoTitle': { type: 'string'   },
		'CompletionDate':        { type: 'date'     },
		'Success':               { type: 'boolean'  }
	}


	getCompletionDate () { } //implemented by CompletionDate date field.
}