import { url } from '@nti/lib-commons';

import Base from '../Model.js';

export default class Preference extends Base {
	// prettier-ignore
	static Fields = {
		Class:    { type: 'string' },
		MimeType: { type: 'string' },
	};

	get href() {
		const p = this.parent();
		return p && url.join(p.href, p.findField(this));
	}
}
