import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class UserTopicParticipationSummary extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationsummary';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Contexts':              { type: 'model[]'                    },
		'NestedChildReplyCount': { type: 'number', name: 'repliesTo'  },
		'ReplyToCount':          { type: 'number', name: 'replies'    },
		'TopLevelCount':         { type: 'number', name: 'comments'   },
	};
}

Registry.register(UserTopicParticipationSummary);
