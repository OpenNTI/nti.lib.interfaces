import { encodeIdFrom } from '../../utils/href-ntiids.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';

import CatalogEntry from './CatalogEntry.js';

export default class CourseCatalogLegacyEntry extends CatalogEntry {
	static MimeType = [
		COMMON_PREFIX + 'courses.coursecataloglegacyentry', //Really?! Two packages?! :P
		COMMON_PREFIX + 'courseware.coursecataloglegacyentry',
	];

	getID() {
		return encodeIdFrom(this.href);
	}
}

Registry.register(CourseCatalogLegacyEntry);
