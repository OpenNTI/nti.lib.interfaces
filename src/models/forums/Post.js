import {mixin} from 'nti-lib-decorators';

// import Editable from '../../mixins/Editable'; //Base already mixes in Editable
import Likable from '../../mixins/Likable';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin(Likable)
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
		'body':  { type: '*[]'    },
		'title': { type: 'string' },
	}
}
