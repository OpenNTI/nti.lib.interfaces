import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class EnrollmentOptions extends Base {
	static MimeType = COMMON_PREFIX + 'courseware.enrollmentoptions'

	static Fields = {
		...Base.Fields,
		'Items': { type: 'model{}' },
	};


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
