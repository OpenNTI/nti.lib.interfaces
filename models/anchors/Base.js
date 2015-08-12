import Model from '../Base';

export default class Base extends Model {
	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, ...mixins);
		Object.defineProperty(this, 'BLACK_LIST_OVERRIDE', {value: {Class: true}});
		Object.assign(this, {
			isEmpty: true,
			MimeType: `application/vnd.nextthought.contentrange.${this.Class.toLowerCase()}`
		});
	}
}
