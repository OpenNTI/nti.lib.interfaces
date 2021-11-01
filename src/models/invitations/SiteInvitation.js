import Registry, { COMMON_PREFIX } from '../Registry.js';

import BaseSiteInvitation from './BaseSiteInvitation.js';

export default class SiteInvitation extends BaseSiteInvitation {
	static MimeType = COMMON_PREFIX + 'siteinvitation';

	// prettier-ignore
	static Fields = {
		...BaseSiteInvitation.Fields
	};
}

Registry.register(SiteInvitation);
