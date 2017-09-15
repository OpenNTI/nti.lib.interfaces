import {model, COMMON_PREFIX} from '../../../Registry';
import Base from '../../../Base';

export default
@model
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
