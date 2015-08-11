import Base from './Base';

export default class ContentPointer extends Base {
	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'ContentPointer'}, ...mixins);
	}
}
