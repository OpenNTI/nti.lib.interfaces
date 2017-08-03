import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');

export default
@model
class EnrollmentOption extends Base {
	static MimeType = [
		COMMON_PREFIX + 'courseware.enrollmentoption',
		COMMON_PREFIX + 'courseware.openenrollmentoption',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		rename('Enabled', 'enabled');
		rename('IsAvailable', 'available');
		rename('IsEnrolled', 'enrolled');
	}
}
