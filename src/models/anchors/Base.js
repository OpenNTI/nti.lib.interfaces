import Model from '../Base';

export default class Base extends Model {
	BLACK_LIST_OVERRIDE = {Class: true}

	isEmpty = true

	constructor (service, parent, data) {
		super(service, parent, data);
		if (!this.MimeType) {
			this.MimeType = this.constructor.MimeType || (() => {throw new TypeError('No MimeType');})();
		}
	}
}
