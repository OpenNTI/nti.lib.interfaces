import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

class UserTopicParticipationContext extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationcontext';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Context':       { type: 'model' },
		'ParentContext': { type: 'model' },
	}
}

export default decorate(UserTopicParticipationContext, { with: [model] });
