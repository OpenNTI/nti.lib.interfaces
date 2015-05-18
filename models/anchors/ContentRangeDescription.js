import Base from './Base';
console.log('defining ContentRangeDescription');
export default class ContentRangeDescription extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	locatorKey () {
		return Symbol.for('locator');
	}


	attachLocator (loc) {
		if (!loc) {
			delete this[this.locatorKey()];
		}
		else {
			this[this.locatorKey()] = loc;
		}
	}


	locator () {
		return this[this.locatorKey()];
	}
}
