import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';
import CompletionMetadata from '../completion/CompletionMetadata.js';

export default class CompletedItem extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.completeditem'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'CompletedDate':       { type: 'date'                       },
		'Success':         	   { type: 'boolean'                    },
		'CompletionMetadata':  { type: CompletionMetadata           }
	}

	getCompletedDate() {} //implemented by CompletedDate date field.
}

Registry.register(CompletedItem);
