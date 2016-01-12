import Base from './Base';

export default class SuggestedContacts extends Base {
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
		console.debug(data);
	}
}
