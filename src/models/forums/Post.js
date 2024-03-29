// import Editable from '../../mixins/Editable'; //Base already mixes in Editable
import Likable from '../../mixins/Likable.js';
import DiscussionInterface from '../../mixins/DiscussionInterface.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class Post extends DiscussionInterface(Likable(Base)) {
	static MimeType = [
		COMMON_PREFIX + 'forums.post',
		COMMON_PREFIX + 'forums.communityheadlinepost',
		COMMON_PREFIX + 'forums.contentheadlinepost',
		COMMON_PREFIX + 'forums.dflheadlinepost',
		COMMON_PREFIX + 'forums.headlinepost',
		COMMON_PREFIX + 'forums.personalblogentrypost',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'body':       { type: '*[]'     },
		'title':      { type: 'string'  },
		'Deleted':    { type: 'boolean' }
	};

	getRawSharedWith() {
		return this.parent().getRawSharedWith();
	}
}

Registry.register(Post);
