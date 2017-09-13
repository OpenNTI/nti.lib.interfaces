import {model, COMMON_PREFIX} from '../Registry';

import Highlight from './Highlight';

export default
@model
class Redaction extends Highlight {
	static MimeType = COMMON_PREFIX + 'redaction'
}
