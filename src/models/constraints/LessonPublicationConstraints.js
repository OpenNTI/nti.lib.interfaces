import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';

import Constraints from './Constraints';

class LessonPublicationConstraints extends Constraints {
	static MimeType = COMMON_PREFIX + 'lesson.publicationconstraints'
}

export default decorate(LessonPublicationConstraints, {with:[model]});
