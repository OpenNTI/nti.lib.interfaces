import { url } from '@nti/lib-commons';

import Base from '../Base.js';

export default class Preference extends Base {
	static Fields = {
		MimeType: { type: 'string' },
	};

	get href() {
		const p = this.parent();
		return url.join(p.href, p.findField(this));
	}
}
