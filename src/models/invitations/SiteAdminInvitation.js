import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import BaseSiteInvitation from './BaseSiteInvitation';

class SiteAdminInvitation extends BaseSiteInvitation {
	static MimeType = COMMON_PREFIX + 'siteadmininvitation';

	// prettier-ignore
	static Fields = {
		...BaseSiteInvitation.Fields
	}
}

export default decorate(SiteAdminInvitation, { with: [model] });
