import {Mixin as HasContent, ContentKeys} from '../../mixins/HasContent';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class Hint extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.hint',
		COMMON_PREFIX + 'assessment.htmlhint',
		COMMON_PREFIX + 'assessment.texthint',
	]

	constructor (service, parent, data) {
		super(service, parent, data, HasContent);
	}

	[ContentKeys] () {
		return ['value'];
	}
}
