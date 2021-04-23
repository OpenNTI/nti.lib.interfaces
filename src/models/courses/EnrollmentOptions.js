import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class EnrollmentOptions extends Base {
	static MimeType = COMMON_PREFIX + 'courseware.enrollmentoptions';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Items': { type: 'model{}' },
	};

	[Symbol.iterator]() {
		let { Items } = this,
			keys = Object.keys(Items),
			{ length } = keys,
			index = 0;

		return {
			next() {
				let done = index >= length,
					value = Items[keys[index++]];

				return { value, done };
			},
		};
	}

	getEnrollmentOptionForOpen() {
		return this.Items.OpenEnrollment;
	}

	getEnrollmentOptionForPurchase() {
		return this.Items.StoreEnrollment;
	}

	getEnrollmentOptionForFiveMinute() {
		return this.Items.FiveminuteEnrollment;
	}
}

export default decorate(EnrollmentOptions, [model]);
