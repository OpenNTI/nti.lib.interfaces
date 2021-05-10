import Registry, { COMMON_PREFIX } from '../Registry.js';

import BaseCredit from './BaseCredit.js';

export default class UserAwardedCredit extends BaseCredit {
	static MimeType = [COMMON_PREFIX + 'credit.userawardedcredit'];
}

Registry.register(UserAwardedCredit);
