import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class UserTopicParticipationContext extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationcontext';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Context':       { type: 'model' },
		'ParentContext': { type: 'model' },
	};
}

Registry.register(UserTopicParticipationContext);
