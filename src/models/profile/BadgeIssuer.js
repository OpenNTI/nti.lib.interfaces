import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class BadgeIssuer extends Base {
	static MimeType = COMMON_PREFIX + 'openbadges.issuer'

	constructor (service, parent, data) {
		super(service, parent, data);
		/*
		"description": "https://ou-alpha.nextthought.com",
		"email": "support@nextthought.com",
		"image": null,
		"name": "OU Alpha",
		"revocationList": null,
		"url": "https://ou-alpha.nextthought.com"
		*/
	}
}
