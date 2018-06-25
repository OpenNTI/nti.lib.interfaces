import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import EnrollmentOption from './EnrollmentOption';

const Purchasables = Symbol('Purchasables');

class Collection extends Base {

	static Fields = {
		'DefaultPurchaseNTIID': { type: 'string'  },
		'DefaultGiftingNTIID':  { type: 'string'  },
		'Items':                { type: 'model[]' },
	}

}


export default
@model
class EnrollmentOptionStore extends EnrollmentOption {
	static MimeType = COMMON_PREFIX + 'courseware.storeenrollmentoption'

	static Fields = {
		...EnrollmentOption.Fields,
		'RequiresAdmission':  { type: 'boolean',  name: 'requiresAdmission'  },
		'AllowVendorUpdates': { type: 'boolean',  name: 'allowVendorUpdates' },
		'Purchasables':       { type: Collection, name: Purchasables         },
	}


	getPurchasables () {
		return this[Purchasables].Items || [];
	}


	getPurchasable (id = this[Purchasables].DefaultPurchaseNTIID) {
		return this.getPurchasables().find(x => x.NTIID === id);
	}


	getPurchasableForGifting () {
		let p = this.getPurchasable();
		if(p && p.giftable) {
			return p;
		}
		return null;
	}

	getPurchasableForRedeeming () {
		let p = this.getPurchasable();
		if(p && p.redeemable) {
			return p;
		}
		return null;
	}
}
