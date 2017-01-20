import Base from '../Base';
import {Parser as parse} from '../../constants';

export default class UserTopicParticipationContext extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Context');
		this[parse]('ParentContext');
	}
}
