import {decorate} from '@nti/lib-commons';

import {encodeIdFrom} from '../../utils/href-ntiids';
import {model, COMMON_PREFIX} from '../Registry';

import CatalogEntry from './CatalogEntry';


class CourseCatalogLegacyEntry extends CatalogEntry {
	static MimeType = [
		COMMON_PREFIX + 'courses.coursecataloglegacyentry', //Really?! Two packages?! :P
		COMMON_PREFIX + 'courseware.coursecataloglegacyentry',
	]


	getID () {
		return encodeIdFrom(this.href);
	}
}

export default decorate(CourseCatalogLegacyEntry, {with:[model]});
