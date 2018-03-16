import {mixin} from 'nti-lib-decorators';

import Completable from '../../../mixins/Completable';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
@mixin(Completable)
class AssignmentReference extends Base {
	static MimeType = COMMON_PREFIX + 'assignmentref'

	static Fields = {
		...Base.Fields,
		'Target-NTIID':  { type: 'string' },
		'label':         { type: 'string' }
	}
}
