import Registry, { COMMON_PREFIX } from '../Registry.js';

import Annotation from './Annotation.js';

export default class Highlight extends Annotation {
	static MimeType = COMMON_PREFIX + 'highlight';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'selectedText': { type: 'string' },
	}
}

Registry.register(Highlight);
