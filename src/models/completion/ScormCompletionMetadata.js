import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class SCORMCompletionMetadata extends Base {
	static MimeType = [COMMON_PREFIX + 'scormcompletionmetadata'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ScormContentInfoNTIID': { type: 'string'   },
		'ScormContentInfoTitle': { type: 'string'   },
		'CompletionDate':        { type: 'date'     },
		'Success':               { type: 'boolean'  }
	};

	getCompletionDate() {} //implemented by CompletionDate date field.
}

Registry.register(SCORMCompletionMetadata);
