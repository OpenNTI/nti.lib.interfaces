import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class CredlyAcclaimBadge extends Base {
	static MimeType = COMMON_PREFIX + 'acclaim.badge';

	// prettier-ignore
	static Fields = {
		'InvalidOrganization': {type: 'boolean'},
		'allow_duplicate_badges': {type: 'boolean'},
		'created_at': {type: 'date', name: 'createdAt'},
		'description': {type: 'string'},
		'badge_url': {type: 'string', name: 'badgeURL'},
		'image_url': {type: 'string', name: 'imageURL'},
		'name': {type: 'string'},
		'organization_id': {type: 'string', name: 'organizationID'},
		'organization_name': {type: 'string', name: 'organizationName'},
		'public': {type: 'boolean'},
		'template_id': {type: 'string', name: 'templateID'},
		'updated_at': {type: 'date', name: 'updatedAt'},
		'visibility': {type: 'string'}
	};

	getID() {
		return this.templateID;
	}
}

Registry.register(CredlyAcclaimBadge);
