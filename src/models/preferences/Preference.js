import { URL as URLUtils } from '@nti/lib-commons';

import Base from '../Base.js';

export default class Preference extends Base {
	get href() {
		const p = this.parent();
		return URLUtils.join(p.href, p.findField(this));
	}
}
