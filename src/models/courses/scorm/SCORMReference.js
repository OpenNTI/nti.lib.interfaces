import {forward} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
@mixin(forward(['getCompletedDate', 'isCompletable', 'hasCompleted', 'updateCompletedState'], 'ScormContentInfo'))
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