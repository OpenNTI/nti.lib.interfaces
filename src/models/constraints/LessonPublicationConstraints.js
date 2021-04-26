import Registry, { COMMON_PREFIX } from '../Registry.js';

import Constraints from './Constraints.js';

export default class LessonPublicationConstraints extends Constraints {
	static MimeType = COMMON_PREFIX + 'lesson.publicationconstraints';
}

Registry.register(LessonPublicationConstraints);
