import Registry, { COMMON_PREFIX } from '../../Registry.js';
import BaseIntegration from '../Integration.js';

export default class GoogleSSOIntegration extends BaseIntegration {
	static MimeType = [COMMON_PREFIX + 'integration.googlessointegration'];
}

Registry.register(GoogleSSOIntegration);
