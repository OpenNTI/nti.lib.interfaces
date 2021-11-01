import Registry, { COMMON_PREFIX } from '../Registry.js';

import BaseSiteInvitation from './BaseSiteInvitation.js';

export default class SiteAdminInvitation extends BaseSiteInvitation {
	static MimeType = COMMON_PREFIX + 'siteadmininvitation';

	// prettier-ignore
	static Fields = {
		...BaseSiteInvitation.Fields
	};
}

Registry.register(SiteAdminInvitation);
