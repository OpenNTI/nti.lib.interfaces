import Model from '../Base';

export default class Base extends Model {
	constructor (service, parent, data) {
		super(service, parent, data);
		Object.defineProperty(this, 'isEmpty', {value: true, writable: true});
		Object.defineProperty(this, 'BLACK_LIST_OVERRIDE', {value: {Class: true}});
		if (!this.MimeType) {
			this.MimeType = this.constructor.MimeType || (() => {throw new TypeError('No MimeType');})();
		}
	}
}
