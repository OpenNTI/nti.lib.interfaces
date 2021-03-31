import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import Completable from '../../mixins/Completable.js';
import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class QuestionSetReference extends Base {
	static MimeType = COMMON_PREFIX + 'questionsetref';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
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

export default decorate(QuestionSetReference, {
	with: [model, mixin(Completable)],
});
