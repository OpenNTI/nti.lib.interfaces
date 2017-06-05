import {model, COMMON_PREFIX} from '../Registry';

import Highlight from './Highlight';

@model
export default class Redaction extends Highlight {
	static MimeType = COMMON_PREFIX + 'redaction'

	constructor (service, parent, data) {
		super(service, parent, data);
	}

}
