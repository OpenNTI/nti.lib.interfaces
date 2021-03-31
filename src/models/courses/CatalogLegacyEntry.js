import { decorate } from '@nti/lib-commons';

import { encodeIdFrom } from '../../utils/href-ntiids.js';
import { model, COMMON_PREFIX } from '../Registry.js';

import CatalogEntry from './CatalogEntry.js';

class CourseCatalogLegacyEntry extends CatalogEntry {
	static MimeType = [
		COMMON_PREFIX + 'courses.coursecataloglegacyentry', //Really?! Two packages?! :P
		COMMON_PREFIX + 'courseware.coursecataloglegacyentry',
	];

	getID() {
		return encodeIdFrom(this.href);
	}
}

export default decorate(CourseCatalogLegacyEntry, { with: [model] });
