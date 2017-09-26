import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class UserTopicParticipationContext extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationcontext'

	static Fields = {
		...Base.Fields,
		'Context':       { type: 'model' },
		'ParentContext': { type: 'model' },
	}

}
