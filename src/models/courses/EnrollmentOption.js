import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');

export default class EnrollmentOption extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		rename('Enabled', 'enabled');
		rename('IsAvailable', 'available');
		rename('IsEnrolled', 'enrolled');
	}
}
