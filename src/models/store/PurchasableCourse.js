import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import Purchasable from './Purchasable';

class PurchasableCourse extends Purchasable {
	static MimeType = COMMON_PREFIX + 'store.purchasablecourse'

	static Fields = {
		...Purchasable.Fields,
		'ID': { type: 'string' }
	}
}

export default decorate(PurchasableCourse, {with:[model]});
