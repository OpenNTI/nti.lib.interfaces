import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class CompletionMetadata extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.completionmetadata'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'FailCount':     { type: 'number'  },
		'SuccessCount':  { type: 'number'  },
		'ItemCount':     { type: 'number'  },
		'Items':  		 { type: 'model[]' }
	}
}

export default decorate(CompletionMetadata, { with: [model] });
