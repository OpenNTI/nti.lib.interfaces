import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import BaseSiteInvitation from './BaseSiteInvitation.js';

class SiteAdminInvitation extends BaseSiteInvitation {
	static MimeType = COMMON_PREFIX + 'siteadmininvitation';

	// prettier-ignore
	static Fields = {
		...BaseSiteInvitation.Fields
	}
}

export default decorate(SiteAdminInvitation, [model]);
