import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class SuggestedContacts extends Base {
	static MimeType = COMMON_PREFIX + 'suggestedcontacts';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ItemCount': { type: 'number' },
	}

	constructor(service, data) {
		super(service, null, data);

		console.debug('TODO: SuggestedContacts:', data); //eslint-disable-line no-console
	}
}

export default decorate(SuggestedContacts, [model]);
