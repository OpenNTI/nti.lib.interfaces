import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import Annotation from './Annotation';

class Highlight extends Annotation {
	static MimeType = COMMON_PREFIX + 'highlight'

	static Fields = {
		...Annotation.Fields,
		'selectedText': { type: 'string' },
	}
}

export default decorate(Highlight, {with:[model]});
