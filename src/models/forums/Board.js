import GetContents from '../../mixins/GetContents.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class Board extends GetContents(Base) {
	static MimeType = [
		COMMON_PREFIX + 'forums.board',
		COMMON_PREFIX + 'forums.communityboard',
		COMMON_PREFIX + 'forums.contentboard',
		COMMON_PREFIX + 'forums.dflboard',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ForumCount':   { type: 'number'                        },
		'description':  { type: 'string'                        },
		'title':        { type: 'string'                        },
		'ordered_keys': { type: 'string[]', name: 'orderedKeys' }
	};

	isBoard = true;

	canCreateForum() {
		return this.hasLink('add');
	}

	async createForum(newForum) {
		const forum = await this.fetchLink({
			method: 'post',
			rel: 'add',
			data: newForum,
		});
		this.emit('change');
		return forum;
	}
}

Registry.register(Board);
