import {model, COMMON_PREFIX} from '../Registry';

import BaseSiteInvitation from './BaseSiteInvitation';

export default
@model
class SiteInvitation extends BaseSiteInvitation {
	static MimeType = COMMON_PREFIX + 'siteinvitation'

	static Fields = {
		...BaseSiteInvitation.Fields
	}

}
