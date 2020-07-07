import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class GradeBookShell extends Base {
	static MimeType = COMMON_PREFIX + 'gradebookshell'
}

export default decorate(GradeBookShell, {with:[model]});
