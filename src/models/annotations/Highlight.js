import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Annotation from './Annotation.js';

class Highlight extends Annotation {
	static MimeType = COMMON_PREFIX + 'highlight';

	// prettier-ignore
	static Fields = {
		...Annotation.Fields,
		'selectedText': { type: 'string' },
	}
}

export default decorate(Highlight, [model]);
