import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import Board from './Board';

class Blog extends Board {
	static MimeType = COMMON_PREFIX + 'forums.personalblog';

	title = 'Thoughts';

	constructor(service, parent, data) {
		delete data.title;
		super(service, parent, data);
	}
}

export default decorate(Blog, { with: [model] });
