import Completable from '../../mixins/Completable.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class QuestionSetReference extends Completable(Base) {
	static MimeType = COMMON_PREFIX + 'questionsetref';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Target-NTIID':   { type: 'string' },
		'question-count': { type: 'number?' },
		'label':          { type: 'string' }
	}

	get target() {
		return this['Target-NTIID'];
	}

	pointsToId(id) {
		return this.target === id;
	}
}

Registry.register(QuestionSetReference);
