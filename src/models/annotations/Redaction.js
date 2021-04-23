import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Highlight from './Highlight.js';

class Redaction extends Highlight {
	static MimeType = COMMON_PREFIX + 'redaction';
}

export default decorate(Redaction, [model]);
