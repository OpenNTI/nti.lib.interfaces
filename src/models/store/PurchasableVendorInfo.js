import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class PurchasableVendorInfo extends Base {
	static MimeType = COMMON_PREFIX + 'store.purchasablevendorinfo'


	static Fields = {
		...Base.Fields,
		'AllowVendorUpdates': { type: 'boolean' },
		'CRN':                { type: '*'       },
		'Duration':           { type: 'string'  },
		'EndDate':            { type: 'date'    },
		'Hours':              { type: 'number'  },
		'StartDate':          { type: 'date'    },
		'Term':               { type: '*'       },
		'Title':              { type: 'string'  }
	}

	getEndDate () {} //implemented by the date Field type
	getStartDate () {} //implemented by the date Field type
}

export default decorate(PurchasableVendorInfo, {with:[model]});
