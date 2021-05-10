import Registry, { COMMON_PREFIX } from '../Registry.js';

import Purchasable from './Purchasable.js';

export default class PurchasableCourse extends Purchasable {
	static MimeType = COMMON_PREFIX + 'store.purchasablecourse';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ID': { type: 'string' }
	}
}

Registry.register(PurchasableCourse);
