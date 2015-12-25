import Base from './Base';

export default class ContentRangeDescription extends Base {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'ContentRangeDescription'}, ...mixins);
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
