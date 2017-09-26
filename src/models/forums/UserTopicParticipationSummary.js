import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class UserTopicParticipationSummary extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationsummary'

	static Fields = {
		...Base.Fields,
		'Contexts':              { type: 'model[]'                    },
		'NestedChildReplyCount': { type: 'number', name: 'repliesTo'  },
		'ReplyToCount':          { type: 'number', name: 'replies'    },
		'TopLevelCount':         { type: 'number', name: 'comments'   },
	}

}
