import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class CatalogFamily extends Base {
	static MimeType = COMMON_PREFIX + 'catalogfamily';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'CatalogFamilyID':               { type: 'string' },
		'Description':                   { type: 'string' },
		'Title':                         { type: 'string' },
		'PlatformPresentationResources': { type: 'object' },
		'ProviderDepartmentTitle':       { type: 'string' },
		'ProviderUniqueID':              { type: 'string' },
		'StartDate':                     { type: 'date'   },
		'EndDate':                       { type: 'date'   }
	}

	getFamilyID() {
		return this.CatalogFamilyID;
	}

	getPresentationProperties() {
		return {
			title: this.Title,
			label: null,
		};
	}
}

export default decorate(CatalogFamily, [model]);
