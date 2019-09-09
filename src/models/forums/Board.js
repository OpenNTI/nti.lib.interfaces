import {mixin} from '@nti/lib-decorators';

import GetContents from '../../mixins/GetContents';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin(GetContents)
class Board extends Base {
	static MimeType = [
		COMMON_PREFIX + 'forums.board',
		COMMON_PREFIX + 'forums.communityboard',
		COMMON_PREFIX + 'forums.contentboard',
		COMMON_PREFIX + 'forums.dflboard',
	]

	static Fields = {
		...Base.Fields,
		'ForumCount':   { type: 'number'                        },
		'description':  { type: 'string'                        },
		'title':        { type: 'string'                        },
		'ordered_keys': { type: 'string[]', name: 'orderedKeys' }
	}

	isBoard = true

	canCreateForum () {
		return this.hasLink('add');
	}

	async createForum (newForum) {
		const forum = await this.postToLink('add', newForum, true);
		this.emit('change');
		return forum;
	}
}
