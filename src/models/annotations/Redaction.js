import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import Highlight from './Highlight';

class Redaction extends Highlight {
	static MimeType = COMMON_PREFIX + 'redaction'
}

export default decorate(Redaction, {with: [model]});
