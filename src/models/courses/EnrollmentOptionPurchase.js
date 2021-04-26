import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

import EnrollmentOption from './EnrollmentOption.js';

const Purchasables = Symbol('Purchasables');

class Collection extends Base {
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'DefaultPurchaseNTIID': { type: 'string'  },
		'DefaultGiftingNTIID':  { type: 'string'  },
		'Items':                { type: 'model[]' },
	}
}

export default class EnrollmentOptionStore extends EnrollmentOption {
	static MimeType = COMMON_PREFIX + 'courseware.storeenrollmentoption';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'RequiresAdmission':  { type: 'boolean',  name: 'requiresAdmission'  },
		'AllowVendorUpdates': { type: 'boolean',  name: 'allowVendorUpdates' },
		'Purchasables':       { type: Collection, name: Purchasables         },
	}

	getPurchasables() {
		return this[Purchasables].Items || [];
	}

	getPurchasable(id = this[Purchasables].DefaultPurchaseNTIID) {
		return this.getPurchasables().find(x => x.NTIID === id);
	}

	getPurchasableForGifting() {
		let p = this.getPurchasable();
		if (p && p.giftable) {
			return p;
		}
		return null;
	}

	getPurchasableForRedeeming() {
		let p = this.getPurchasable();
		if (p && p.redeemable) {
			return p;
		}
		return null;
	}
}

Registry.register(EnrollmentOptionStore);
