import Registry, { COMMON_PREFIX } from '../Registry.js';

import Preference from './Preference.js';

export default class WebApp extends Preference {
	static MimeType = COMMON_PREFIX + 'preference.webapp';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'preferFlashVideo': { type: 'boolean' },
        'useHighContrast':  { type: 'boolean' },
	};
}

Registry.register(WebApp);
