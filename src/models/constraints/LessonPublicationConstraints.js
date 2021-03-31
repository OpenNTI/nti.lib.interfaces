import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Constraints from './Constraints.js';

class LessonPublicationConstraints extends Constraints {
	static MimeType = COMMON_PREFIX + 'lesson.publicationconstraints';
}

export default decorate(LessonPublicationConstraints, { with: [model] });
