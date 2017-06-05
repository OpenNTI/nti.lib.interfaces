import {model, COMMON_PREFIX} from '../Registry';

import Base from './Base';

@model
export default class TextContext extends Base {
	static MimeType = COMMON_PREFIX + 'contentrange.textcontext'

	constructor (service, parent, data) {
		super(service, parent, data);

		this.isEmpty = false;

		this.validateOffset(data.contextOffset);
		this.validateText(data.contextText);
	}


	getContextText () { return this.contextText; }
	getContextOffset () { return this.contextOffset; }


	validateOffset (offset) {
		if (offset == null) {
			throw new Error('No offset supplied');
		}
		else if (offset < 0) {
			throw new Error('Offset must be greater than 0, supplied value: ' + offset);
		}
	}


	validateText (text) {
		if (!text || text.length < 0) {
			throw new Error('Text must have one or more characters');
		}
	}
}
