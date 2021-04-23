import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Board from './Board.js';

class Blog extends Board {
	static MimeType = COMMON_PREFIX + 'forums.personalblog';

	title = 'Thoughts';

	constructor(service, parent, data) {
		delete data.title;
		super(service, parent, data);
	}
}

export default decorate(Blog, [model]);
