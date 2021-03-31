import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class UserTopicParticipationSummary extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationsummary';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Contexts':              { type: 'model[]'                    },
		'NestedChildReplyCount': { type: 'number', name: 'repliesTo'  },
		'ReplyToCount':          { type: 'number', name: 'replies'    },
		'TopLevelCount':         { type: 'number', name: 'comments'   },
	}
}

export default decorate(UserTopicParticipationSummary, { with: [model] });
