import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';
import CompletionMetadata from '../completion/CompletionMetadata';

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
