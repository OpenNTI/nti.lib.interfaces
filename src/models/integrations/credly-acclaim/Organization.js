import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class CredlyAcclaimOrganization extends Base {
	static MimeType = [COMMON_PREFIX + 'acclaim.organization'];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'contact_email': {type: 'string', name: 'contactEmail'},
		'name': {type: 'string'},
		'organization_id': {type: 'string', name: 'organizationId'},
		'photo_url': {type: 'string', name: 'photoURL'},
		'website_url': {type: 'string', name: 'websiteURL'}
	}
}

export default decorate(CredlyAcclaimOrganization, [model]);
