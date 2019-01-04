import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class CatalogFamily extends Base {
	static MimeType = COMMON_PREFIX + 'catalogfamily'

	static Fields = {
		...Base.Fields,
		'CatalogFamilyID':               { type: 'string' },
		'Description':                   { type: 'string' },
		'Title':                         { type: 'string' },
		'PlatformPresentationResources': { type: 'object' },
		'ProviderDepartmentTitle':       { type: 'string' },
		'ProviderUniqueID':              { type: 'string' },
		'StartDate':                     { type: 'date'   },
		'EndDate':                       { type: 'date'   }
	}

	getFamilyID () { return this.CatalogFamilyID; }

	getPresentationProperties () {
		return {
			title: this.Title,
			label: null
		};
	}
}
