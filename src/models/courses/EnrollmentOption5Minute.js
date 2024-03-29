import Registry, { COMMON_PREFIX } from '../Registry.js';

import EnrollmentOption from './EnrollmentOption.js';

export default class EnrollmentOption5Minute extends EnrollmentOption {
	static MimeType = COMMON_PREFIX + 'courseware.fiveminuteenrollmentoption';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'EnrollCutOffDate':      { type: 'date',                                   },
		'RequiresAdmission':     { type: 'boolean', name: 'requiresAdmission'      },
		'AllowVendorUpdates':    { type: 'boolean', name: 'allowVendorUpdates'     },
		'OU_AllowVendorUpdates': { type: 'boolean', name: 'allowVendorUpdates(ou)' },
		'OU_DropCutOffDate':     { type: 'date',                                   },
		'OU_EnrollCutOffDate':   { type: 'date',                                   },
		'OU_RefundCutOffDate':   { type: 'date',                                   },
		'RefundCutOffDate':      { type: 'date',                                   },
	};

	constructor(service, parent, data) {
		super(service, parent, data);

		if (this.available && this.getEnrollCutOffDate() < Date.now()) {
			this.available = false;
		}
	}

	getEnrollCutOffDate() {} //implemented by the date Field type
	getRefundCutOffDate() {} //implemented by the date Field type
}

Registry.register(EnrollmentOption5Minute);
