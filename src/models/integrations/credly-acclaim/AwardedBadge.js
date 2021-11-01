import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class CredlyAcclaimAwardedBadge extends Base {
	static MimeType = COMMON_PREFIX + 'acclaim.awardedbadge';

	// prettier-ignore
	static Fields = {
		'accept_badge_url': {type: 'string', name: 'acceptBadgeURL'},
		'badge_template': {type: 'model', name: 'badgeTemplate'},
		'created_at': {type: 'string', name: 'createdAt'},
		'image_url': {type: 'string', name: 'imageURL'},
		'locale': {type: 'string'},
		'public': {type: 'boolean'},
		'recipient_email': {type: 'string', name: 'recipientEmail'},
		'state': {type: 'string'},
		'updated_at': {type: 'string', name: 'updatedAt'}
	};

	get name() {
		return this.badgeTemplate.name;
	}
	get description() {
		return this.badgeTemplate.description;
	}
	get badgeURL() {
		return this.badgeTemplate.badgeURL;
	}
	get organizationName() {
		return this.badgeTemplate.organizationName;
	}
}

Registry.register(CredlyAcclaimAwardedBadge);
