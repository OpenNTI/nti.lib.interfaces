import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class UserTopicParticipationContext extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationcontext';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Context':       { type: 'model' },
		'ParentContext': { type: 'model' },
	}
}

export default decorate(UserTopicParticipationContext, [model]);
