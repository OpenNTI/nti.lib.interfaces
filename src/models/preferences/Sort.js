import { decorate, URL as URLUtils } from '@nti/lib-commons';

import Base from '../Base.js';
import { model, COMMON_PREFIX } from '../Registry.js';

class PreferencesSort extends Base {
	static MimeType = COMMON_PREFIX + 'preference.sort';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'sortOn':        { type: 'string'},
		'sortDirection': { type: 'string'},
	}

	get href() {
		const p = this.parent();
		return URLUtils.join(p.href, p.findField(this));
	}
}

export default decorate(PreferencesSort, { with: [model] });
