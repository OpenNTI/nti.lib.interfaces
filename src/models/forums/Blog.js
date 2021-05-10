import Registry, { COMMON_PREFIX } from '../Registry.js';

import Board from './Board.js';

export default class Blog extends Board {
	static MimeType = COMMON_PREFIX + 'forums.personalblog';

	title = 'Thoughts';

	constructor(service, parent, data) {
		delete data.title;
		super(service, parent, data);
	}
}

Registry.register(Blog);
