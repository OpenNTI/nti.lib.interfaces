import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

class WebApp extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.webapp';

	// prettier-ignore
	static Fields = {
		...Preference.Fields,
		'preferFlashVideo': { type: 'boolean' },
        'useHighContrast':  { type: 'boolean' },
	}
}

export default decorate(WebApp, [model]);
