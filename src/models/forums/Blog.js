import {model, COMMON_PREFIX} from '../Registry';

import Board from './Board';

export default
@model
class Blog extends Board {
	static MimeType = COMMON_PREFIX + 'forums.personalblog'

	constructor (service, parent, data) {
		delete data.title;
		super(service, parent, data);
	}

	get title () { return 'Thoughts'; }
}
