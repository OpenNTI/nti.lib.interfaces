import { register } from '../registry.js';
import { createScopedHandlers } from '../createHandlers.js';

import Question from './Question.js';
import QuestionSet from './QuestionSet.js';

const AssignmentType = 'application/vnd.nextthought.assessment.assignment';
const TimedAssignmentType =
	'application/vnd.nextthought.assessment.timedassignment';
const handlers = [Question, QuestionSet];

register(createScopedHandlers([AssignmentType, TimedAssignmentType], handlers));
