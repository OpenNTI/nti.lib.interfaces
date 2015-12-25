import Model from '../Base';

export default class Base extends Model {
	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, ...mixins);
		Object.defineProperty(this, 'isEmpty', {value: true, writable: true});
		Object.defineProperty(this, 'BLACK_LIST_OVERRIDE', {value: {Class: true}});
		Object.assign(this, {
			MimeType: `application/vnd.nextthought.contentrange.${this.Class.toLowerCase()}`
		});
	}
}
