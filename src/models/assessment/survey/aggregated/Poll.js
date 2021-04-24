import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../../Registry.js';
import Base from '../../../Base.js';

class AggregatedPoll extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedpoll';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'parts':            { type: 'model[]' },
		'pollId':           { type: 'string'  },
		'ContainerContext': { type: '*'       },
	}

	getID() {
		return this.pollId;
	}
}

export default decorate(AggregatedPoll, [model]);
