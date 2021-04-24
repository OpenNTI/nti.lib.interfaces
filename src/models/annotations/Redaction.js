import Registry, { COMMON_PREFIX } from '../Registry.js';

import Highlight from './Highlight.js';

export default class Redaction extends Highlight {
	static MimeType = COMMON_PREFIX + 'redaction';
}

Registry.register(Redaction);
