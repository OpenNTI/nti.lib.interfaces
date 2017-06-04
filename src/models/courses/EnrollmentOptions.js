import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class EnrollmentOptions extends Base {
	static MimeType = COMMON_PREFIX + 'courseware.enrollmentoptions'

	constructor (service, parent, data) {
		super(service, parent, data);

		// console.log('Enrollment Options:', data);

		let {Items} = data;
		let options = this.Items = {};

		for (let key of Object.keys(Items)) {
			options[key] = this[parse](Items[key]);
		}
	}

	[Symbol.iterator] () {
		let {Items} = this,
			keys = Object.keys(Items),
			{length} = keys,
			index = 0;

		return {

			next () {
				let done = index >= length,
					value = Items[keys[index++]];

				return { value, done };
			}

		};
	}


	getEnrollmentOptionForOpen () {
		return this.Items.OpenEnrollment;
	}


	getEnrollmentOptionForPurchase () {
		return this.Items.StoreEnrollment;
	}


	getEnrollmentOptionForFiveMinute () {
		return this.Items.FiveminuteEnrollment;
	}
}
