import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class CompletableItemDefaultRequiredPolicy extends Base {
	static MimeType = [COMMON_PREFIX + 'completion.defaultrequiredpolicy'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'mime_types': { type: 'string[]', name: 'mimeTypes' }
	}
}

export default decorate(CompletableItemDefaultRequiredPolicy, {
	with: [model],
});
