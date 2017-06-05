import {mixin} from 'nti-lib-decorators';

// import Editable from '../../mixins/Editable'; //Base already mixes in Editable
import Likable from '../../mixins/Likable';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
@mixin(Likable)
export default class Post extends Base {
	static MimeType = [
		COMMON_PREFIX + 'forums.post',
		COMMON_PREFIX + 'forums.communityheadlinepost',
		COMMON_PREFIX + 'forums.contentheadlinepost',
		COMMON_PREFIX + 'forums.dflheadlinepost',
		COMMON_PREFIX + 'forums.headlinepost',
		COMMON_PREFIX + 'forums.personalblogentrypost',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		//body
		//title
	}
}
