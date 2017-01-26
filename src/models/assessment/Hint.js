import Base from '../Base';
import {Mixin as HasContent, ContentKeys} from '../../mixins/HasContent';

export default class Hint extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, HasContent);
	}

	[ContentKeys] () {
		return ['value'];
	}
}
