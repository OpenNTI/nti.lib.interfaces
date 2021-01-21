import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import BaseIntegration from '../Integration';

class GoogleSSOIntegration extends BaseIntegration {
	static MimeType = [
		COMMON_PREFIX + 'integration.googlessointegration'
	]
}

export default decorate(GoogleSSOIntegration, {with: [model]});
