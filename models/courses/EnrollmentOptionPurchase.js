import EnrollmentOption from './EnrollmentOption';
import {Parser as parse} from '../../CommonSymbols';

const TakeOver = Symbol.for('TakeOver');
const getPurchasables = Symbol('getPurchasables');
const Purchasables = Symbol('Purchasables');

export default class EnrollmentOptionStore extends EnrollmentOption {
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
		return this.getPurchasable(this[Purchasables].DefaultGiftingNTIID);
	}
}
