import Base from '../../../Base';
import {Parser as parse} from '../../../../constants';

export default class AggregatedPoll extends Base {

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