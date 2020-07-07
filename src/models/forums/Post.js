import {decorate} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

// import Editable from '../../mixins/Editable'; //Base already mixes in Editable
import Likable from '../../mixins/Likable';
import DiscussionInterface from '../../mixins/DiscussionInterface';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class Post extends Base {
	static MimeType = [
		COMMON_PREFIX + 'forums.post',
		COMMON_PREFIX + 'forums.communityheadlinepost',
		COMMON_PREFIX + 'forums.contentheadlinepost',
		COMMON_PREFIX + 'forums.dflheadlinepost',
		COMMON_PREFIX + 'forums.headlinepost',
		COMMON_PREFIX + 'forums.personalblogentrypost',
	]

	static Fields = {
		...Base.Fields,
		'body':       { type: '*[]'     },
		'title':      { type: 'string'  },
		'Deleted':    { type: 'boolean' }
	}

	getRawSharedWith () {
		return this.parent().getRawSharedWith();
	}
}

export default decorate(Post, {with:[
	model,
	mixin(Likable, DiscussionInterface)
]});
