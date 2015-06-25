import EnrollmentOption from './EnrollmentOption';
import {
	DateFields,
	// Parser as parse
} from '../../CommonSymbols';

const TakeOver = Symbol.for('TakeOver');
const SetProtectedProperty = Symbol.for('SetProtectedProperty');

export default class EnrollmentOption5Minute extends EnrollmentOption {
	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		rename('RequiresAdmission', 'requiresAdmission');
		rename('AllowVendorUpdates', 'allowVendorUpdates');
		rename('OU_AllowVendorUpdates', 'allowVendorUpdates(ou)');

		// console.log('Enrollment Option (5M):', this);

		if (this.available && this.getEnrollCutOffDate() < Date.now()) {
			this[SetProtectedProperty]('available', false);
		}
	}


	[DateFields] () {
		return super[DateFields]().concat([
			'EnrollCutOffDate',
			'OU_DropCutOffDate',
			'OU_EnrollCutOffDate',
			'OU_RefundCutOffDate',
			'RefundCutOffDate'
		]);
	}

}
