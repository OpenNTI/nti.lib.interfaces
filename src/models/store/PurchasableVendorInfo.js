import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class PurchasableVendorInfo extends Base {
	static MimeType = COMMON_PREFIX + 'store.purchasablevendorinfo';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'AllowVendorUpdates': { type: 'boolean' },
		'CRN':                { type: '*'       },
		'Duration':           { type: 'string'  },
		'EndDate':            { type: 'date'    },
		'Hours':              { type: 'number'  },
		'StartDate':          { type: 'date'    },
		'Term':               { type: '*'       },
		'Title':              { type: 'string'  }
	};

	getEndDate() {} //implemented by the date Field type
	getStartDate() {} //implemented by the date Field type
}

Registry.register(PurchasableVendorInfo);
