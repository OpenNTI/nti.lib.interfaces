import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class CatalogFamilies extends Base {
	static MimeType = COMMON_PREFIX + 'catalogfamilies';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items': {type: 'model[]'}
	};

	getPrimaryFamily() {
		return this.Items && this.Items[0];
	}

	containsFamily(familyOrId) {
		if (!familyOrId) {
			return false;
		}

		const familyId =
			typeof familyOrId === 'string'
				? familyOrId
				: familyOrId.getFamilyID && familyOrId.getFamilyID();

		if (!familyId) {
			return false;
		}

		for (let family of this.Items) {
			if (family.getFamilyID() === familyId) {
				return true;
			}
		}

		return false;
	}

	hasIntersectionWith(families) {
		if (!families || !families.containsFamily) {
			return false;
		}

		for (let family of this.Items) {
			if (families.containsFamily(family)) {
				return true;
			}
		}

		return true;
	}

	getFamilyIDs() {
		return this.Items.map(family => family.getFamilyID());
	}
}

Registry.register(CatalogFamilies);
