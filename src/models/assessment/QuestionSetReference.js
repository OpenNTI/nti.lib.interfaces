import {decorate} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import Completable from '../../mixins/Completable';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class QuestionSetReference extends Base {
	static MimeType = COMMON_PREFIX + 'questionsetref'

	static Fields = {
		...Base.Fields,
		'Target-NTIID':   { type: 'string' },
		'question-count': { type: 'number?' },
		'label':          { type: 'string' }
	}


	get target () {
		return this['Target-NTIID'];
	}

	pointsToId (id) {
		return this.target === id;
	}
}

export default decorate(QuestionSetReference, {with:[
	model,
	mixin(Completable),
]});
