import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class CompletionPolicy extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.aggregatecompletionpolicy'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'percentage':                    { type: 'number'                                       },
		'offers_completion_certificate': { type: 'boolean', name: 'offersCompletionCertificate' }
	}
}

export default decorate(CompletionPolicy, { with: [model] });
