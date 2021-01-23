import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

class CredlyAcclaimAwardedBadge extends Base {
	static MimeType = COMMON_PREFIX + 'acclaim.awardedbadge';

	static Fields = {
		'accept_badge_url': {type: 'string', name: 'acceptBadgeURL'},
		'badge_template': {type: 'model'},
		'badge_url': {type: 'string', name: 'badgeURL'},
		'created_at': {type: 'string', name: 'createdAt'},
		'image_url': {type: 'string', name: 'imageURL'},
		'locale': {type: 'string'},
		'public': {type: 'boolean'},
		'recipient_email': {type: 'string', name: 'recipientEmail'},
		'state': {type: 'string'},
		'updated_at': {type: 'string', name: 'updatedAt'}
	}
}

export default decorate(CredlyAcclaimAwardedBadge, {with: [model]});
