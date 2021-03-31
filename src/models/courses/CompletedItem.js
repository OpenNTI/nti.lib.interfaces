import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';
import CompletionMetadata from '../completion/CompletionMetadata.js';

class CompletedItem extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.completeditem'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'CompletedDate':       { type: 'date'                       },
		'Success':         	   { type: 'boolean'                    },
		'CompletionMetadata':  { type: CompletionMetadata           }
	}

	getCompletedDate() {} //implemented by CompletedDate date field.
}

export default decorate(CompletedItem, { with: [model] });
