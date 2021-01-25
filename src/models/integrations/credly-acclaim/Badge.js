import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

class CredlyAcclaimBadge extends Base {
	static MimeType = COMMON_PREFIX + 'acclaim.badge';

	static Fields = {
		'InvalidOrganization': {type: 'boolean'},
		'allow_duplicate_badges': {type: 'boolean'},
		'created_at': {type: 'date', name: 'createdAt'},
		'description': {type: 'string'},
		'image_url': {type: 'string', name: 'imageURL'},
		'name': {type: 'string'},
		'organization_id': {type: 'string', name: 'organizationID'},
		'public': {type: 'boolean'},
		'template_id': {type: 'string', name: 'templateID'},
		'updated_at': {type: 'date', name: 'updatedAt'},
		'visibility': {type: 'string'}
	}
}

export default decorate(CredlyAcclaimBadge, {with: [model]});