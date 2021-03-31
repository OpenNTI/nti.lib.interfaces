import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import BaseIntegration from '../Integration.js';

class GoogleSSOIntegration extends BaseIntegration {
	static MimeType = [COMMON_PREFIX + 'integration.googlessointegration'];
}

export default decorate(GoogleSSOIntegration, { with: [model] });
