import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class SCORMCompletionMetadata extends Base {
	static MimeType = [COMMON_PREFIX + 'scormcompletionmetadata'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ScormContentInfoNTIID': { type: 'string'   },
		'ScormContentInfoTitle': { type: 'string'   },
		'CompletionDate':        { type: 'date'     },
		'Success':               { type: 'boolean'  }
	}

	getCompletionDate() {} //implemented by CompletionDate date field.
}

export default decorate(SCORMCompletionMetadata, [model]);
