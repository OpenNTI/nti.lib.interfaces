import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

export default class GradeBookShell extends Base {
	static MimeType = COMMON_PREFIX + 'gradebookshell';
}

Registry.register(GradeBookShell);
