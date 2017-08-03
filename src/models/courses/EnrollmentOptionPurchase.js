import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import EnrollmentOption from './EnrollmentOption';

const TakeOver = Symbol.for('TakeOver');
const getPurchasables = Symbol('getPurchasables');
const Purchasables = Symbol('Purchasables');

export default
@model
class EnrollmentOptionStore extends EnrollmentOption {
	static MimeType = COMMON_PREFIX + 'courseware.storeenrollmentoption'

	constructor (service, parent, data) {
		super(service, parent, data);

		// console.log('Enrollment Option (Purchase):', this);

		const rename = (x, y) => this[TakeOver](x, y);

		rename('RequiresAdmission', 'requiresAdmission');
		rename('AllowVendorUpdates', 'allowVendorUpdates');
		rename('Purchasables', Purchasables);

		let Items = this[getPurchasables]();

		let parsedItems = this[Purchasables].Items = [];

		for (let p = 0, len = Items.length; p < len; p++) {
			parsedItems[p] = this[parse](Items[p]);
		}
	}


	[getPurchasables] () {
		let {Items = []} = this[Purchasables];
		return Items;
	}


	getPurchasable (id = this[Purchasables].DefaultPurchaseNTIID) {
		return this[getPurchasables]().find(x => x.NTIID === id);
	}


	getPurchasableForGifting () {
		let p = this.getPurchasable(this[Purchasables].DefaultGiftingNTIID);
		if(p && p.giftable) {
			return p;
		}
		return null;
	}
}
