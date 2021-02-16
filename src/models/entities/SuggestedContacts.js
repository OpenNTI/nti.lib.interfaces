import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class SuggestedContacts extends Base {
	static MimeType = COMMON_PREFIX + 'suggestedcontacts';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'ItemCount': { type: 'number' },
	}

	constructor(service, data) {
		super(service, null, data);

		console.debug('TODO: SuggestedContacts:', data); //eslint-disable-line no-console
	}
}

export default decorate(SuggestedContacts, { with: [model] });
