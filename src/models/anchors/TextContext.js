import Base from './Base';

export default class TextContext extends Base {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'TextContext'}, ...mixins);

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