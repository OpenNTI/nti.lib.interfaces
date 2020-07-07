import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class CompletableItemDefaultRequiredPolicy extends Base {
	static MimeType = [
		COMMON_PREFIX + 'completion.defaultrequiredpolicy',
	]

	static Fields = {
		...Base.Fields,
		'mime_types': { type: 'string[]', name: 'mimeTypes' }
	}
}

export default decorate(CompletableItemDefaultRequiredPolicy, {with:[model]});
