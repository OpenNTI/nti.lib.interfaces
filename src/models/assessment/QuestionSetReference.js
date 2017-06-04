import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class QuestionSetReference extends Base {
	static MimeType = COMMON_PREFIX + 'questionsetref'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
