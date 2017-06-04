import {Parser as parse} from '../../../../constants';
import {model, COMMON_PREFIX} from '../../../Registry';
import Base from '../../../Base';

@model
export default class AggregatedPoll extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.aggregatedpoll'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('parts', []);

		// ContainerContext
		// pollId
	}


	getID () {
		return this.pollId;
	}
}
