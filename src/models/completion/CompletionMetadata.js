import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class CompletionMetadata extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.completionmetadata'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'FailCount':     { type: 'number'  },
		'SuccessCount':  { type: 'number'  },
		'ItemCount':     { type: 'number'  },
		'Items':  		 { type: 'model[]' }
	};
}

Registry.register(CompletionMetadata);
