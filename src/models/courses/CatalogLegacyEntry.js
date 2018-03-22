import {model, COMMON_PREFIX} from '../Registry';

import CatalogEntry from './CatalogEntry';



export default
@model
class CourseCatalogLegacyEntry extends CatalogEntry {
	static MimeType = [
		COMMON_PREFIX + 'courses.coursecataloglegacyentry', //Really?! Two packages?! :P
		COMMON_PREFIX + 'courseware.coursecataloglegacyentry',
	]
}
