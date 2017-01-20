import Base from '../Base';
import {Parser as parse} from '../../constants';

export default class UserTopicParticipationSummary extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Contexts');
	}
}
