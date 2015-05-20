import Model from '../Base';

export default class Base extends Model {
	constructor (service, parent, data) {
		super(service, parent, data);

		let MimeType = 'application/vnd.nextthought.contentrange.' + (this.constructor.name.toLowerCase());
		if (this.MimeType && this.MimeType !== MimeType) {
			console.warn('Type Missmatch?', this.MimeType, 'expected: ' + MimeType);
		}

		Object.assign(this, {MimeType, isEmpty: true});
	}
}
