import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import BaseCredit from './BaseCredit';

class UserAwardedCredit extends BaseCredit {
	static MimeType = [COMMON_PREFIX + 'credit.userawardedcredit'];
}

export default decorate(UserAwardedCredit, { with: [model] });
