import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class SuggestedContacts extends Base {
	static MimeType = COMMON_PREFIX + 'suggestedcontacts'

	static Fields = {
		...Base.Fields,
		'ItemCount': { type: 'number' },
	}

	constructor (service, data) {
		super(service, null, data);

		console.debug('TODO: SuggestedContacts:', data); //eslint-disable-line no-console
	}
}
