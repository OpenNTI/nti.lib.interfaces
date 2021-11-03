import Completable from '../../../mixins/Completable.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

export default class AssignmentReference extends Completable(Base) {
	static MimeType = COMMON_PREFIX + 'assignmentref';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Target-NTIID':  { type: 'string' },
		'label':         { type: 'string' },
		'title':         { type: 'string' },
	};

	get target() {
		return this['Target-NTIID'];
	}

	pointsToId(id) {
		return this['Target-NTIID'] === id;
	}
}

Registry.register(AssignmentReference);
