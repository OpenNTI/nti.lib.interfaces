import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class WordEntry extends Base {
	static MimeType = COMMON_PREFIX + 'naqwordentry'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
