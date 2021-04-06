import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class PreferenceWebApp extends Base {
	static MimeType = COMMON_PREFIX + 'preference.webapp';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'preferFlashVideo': { type: 'boolean' },
        'useHighContrast':  { type: 'boolean' },
	}
}

export default decorate(PreferenceWebApp, { with: [model] });
