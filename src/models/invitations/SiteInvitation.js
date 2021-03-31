import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import BaseSiteInvitation from './BaseSiteInvitation.js';

class SiteInvitation extends BaseSiteInvitation {
	static MimeType = COMMON_PREFIX + 'siteinvitation';

	// prettier-ignore
	static Fields = {
		...BaseSiteInvitation.Fields
	}
}

export default decorate(SiteInvitation, { with: [model] });
