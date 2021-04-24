import Registry, { COMMON_PREFIX } from '../Registry.js';

import Annotation from './Annotation.js';

export default class Bookmark extends Annotation {
	static MimeType = COMMON_PREFIX + 'bookmark';
}

Registry.register(Bookmark);
