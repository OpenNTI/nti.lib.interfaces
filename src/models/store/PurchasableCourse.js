import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Purchasable from './Purchasable.js';

class PurchasableCourse extends Purchasable {
	static MimeType = COMMON_PREFIX + 'store.purchasablecourse';

	// prettier-ignore
	static Fields = {
		...Purchasable.Fields,
		'ID': { type: 'string' }
	}
}

export default decorate(PurchasableCourse, [model]);
