import {model, COMMON_PREFIX} from '../Registry';

import Constraints from './Constraints';

export default
@model
class LessonPublicationConstraints extends Constraints {
	static MimeType = COMMON_PREFIX + 'lesson.publicationconstraints'
}