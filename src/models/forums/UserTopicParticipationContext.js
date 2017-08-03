import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class UserTopicParticipationContext extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationcontext'

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Context');
		this[parse]('ParentContext');
	}
}
