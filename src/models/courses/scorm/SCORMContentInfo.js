import {mixin} from '@nti/lib-decorators';

import Completable from '../../../mixins/Completable';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
@mixin(Completable)
class SCORMContentInfo extends Base {
	static MimeType = [
		COMMON_PREFIX + 'scorm.scormcontentinfo'
	]

	static Fields = {
		...Base.Fields,
		'scorm_id': {type: 'string', name: 'scormId'},
		'title':    {type: 'string'                 }
	}
}