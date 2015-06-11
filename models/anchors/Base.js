import Model from '../Base';

export default class Base extends Model {
	constructor (service, parent, data) {
		super(service, parent, data);
		Object.assign(this, {isEmpty: true});
	}
}
