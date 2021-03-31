import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Annotation from './Annotation.js';

class Bookmark extends Annotation {
	static MimeType = COMMON_PREFIX + 'bookmark';
}

export default decorate(Bookmark, { with: [model] });
