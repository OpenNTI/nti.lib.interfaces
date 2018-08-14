import {model, COMMON_PREFIX} from '../Registry';

import BaseSiteInvitation from './BaseSiteInvitation';

export default
@model
class SiteAdminInvitation extends BaseSiteInvitation {
	static MimeType = COMMON_PREFIX + 'siteadmininvitation'

	static Fields = {
		...BaseSiteInvitation.Fields
	}

}
