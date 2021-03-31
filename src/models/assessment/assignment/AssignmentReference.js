import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import Completable from '../../../mixins/Completable.js';
import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class AssignmentReference extends Base {
	static MimeType = COMMON_PREFIX + 'assignmentref';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Target-NTIID':  { type: 'string' },
		'label':         { type: 'string' },
		'title':         { type: 'string' },
	}

	get target() {
		return this['Target-NTIID'];
	}

	pointsToId(id) {
		return this['Target-NTIID'] === id;
	}
}

export default decorate(AssignmentReference, {
	with: [model, mixin(Completable)],
});
