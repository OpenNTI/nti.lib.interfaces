import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import GetContents from '../../mixins/GetContents.js';
import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class Board extends Base {
	static MimeType = [
		COMMON_PREFIX + 'forums.board',
		COMMON_PREFIX + 'forums.communityboard',
		COMMON_PREFIX + 'forums.contentboard',
		COMMON_PREFIX + 'forums.dflboard',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'ForumCount':   { type: 'number'                        },
		'description':  { type: 'string'                        },
		'title':        { type: 'string'                        },
		'ordered_keys': { type: 'string[]', name: 'orderedKeys' }
	}

	isBoard = true;

	canCreateForum() {
		return this.hasLink('add');
	}

	async createForum(newForum) {
		const forum = await this.postToLink('add', newForum, true);
		this.emit('change');
		return forum;
	}
}

export default decorate(Board, [model, mixin(GetContents)]);
