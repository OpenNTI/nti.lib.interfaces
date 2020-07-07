import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../../../Registry';
import Base from '../../../Base';

class AggregatedPoll extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedpoll'

	static Fields = {
		...Base.Fields,
		'parts':            { type: 'model[]' },
		'pollId':           { type: 'string'  },
		'ContainerContext': { type: '*'       },
	}


	getID () {
		return this.pollId;
	}
}

export default decorate(AggregatedPoll, {with:[model]});
