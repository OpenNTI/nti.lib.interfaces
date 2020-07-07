import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry';

import Annotation from './Annotation';

class Bookmark extends Annotation {
	static MimeType = COMMON_PREFIX + 'bookmark';
}

export default decorate(Bookmark, { with: [model]});
