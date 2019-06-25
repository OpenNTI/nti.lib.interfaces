import {mixin} from '@nti/lib-decorators';

import Completable from '../../../mixins/Completable';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
@mixin(Completable)
class SCORMReference extends Base {
	static MimeType = [
		COMMON_PREFIX + 'scormcontentref'
	]

	static Fields = {
		...Base.Fields,
		'title':            { type: 'string' },
		'description':      { type: 'string' },
		'icon':             { type: 'string' },
		'target':           { type: 'string' },
		'ScormContentInfo': {type: 'model' }
	}
}