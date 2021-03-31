import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class GradeBookShell extends Base {
	static MimeType = COMMON_PREFIX + 'gradebookshell';
}

export default decorate(GradeBookShell, { with: [model] });
