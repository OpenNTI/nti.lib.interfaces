import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class CatalogFamily extends Base {
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
	};

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

Registry.register(CatalogFamily);
