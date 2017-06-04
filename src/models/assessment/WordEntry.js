import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class WordEntry extends Base {
	static MimeType = COMMON_PREFIX + 'naqwordentry'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
