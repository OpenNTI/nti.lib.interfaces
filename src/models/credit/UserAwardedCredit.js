import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import BaseCredit from './BaseCredit.js';

class UserAwardedCredit extends BaseCredit {
	static MimeType = [COMMON_PREFIX + 'credit.userawardedcredit'];
}

export default decorate(UserAwardedCredit, { with: [model] });
