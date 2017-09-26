import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class UserTopicParticipationSummary extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationsummary'

	static Fields = {
		'TopLevelCount':         {type: 'number', name: 'comments' },
		'ReplyToCount':          {type: 'number', name: 'replies'  },
		'NestedChildReplyCount': {type: 'number', name: 'repliesTo'},
		'Contexts':              {type: 'model[]'                  },
	}
}
