import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import BaseSiteInvitation from './BaseSiteInvitation';

class SiteInvitation extends BaseSiteInvitation {
	static MimeType = COMMON_PREFIX + 'siteinvitation';

	// prettier-ignore
	static Fields = {
		...BaseSiteInvitation.Fields
	}
}

export default decorate(SiteInvitation, { with: [model] });
