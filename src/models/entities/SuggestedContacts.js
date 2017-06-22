import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class SuggestedContacts extends Base {
	static MimeType = COMMON_PREFIX + 'suggestedcontacts'

	constructor (service, data) {
		super(service, null, data);

		/*
		{
			"Class": "SuggestedContacts",
			"ItemCount": 0,
			"MimeType": "application/vnd.nextthought.suggestedcontacts",
			"href": "/dataserver2/users/local2/SuggestedContacts"
		}
	*/
		console.debug('TODO: SuggestedContacts:', data); //eslint-disable-line no-console
	}
}
