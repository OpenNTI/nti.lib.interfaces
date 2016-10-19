import {createHandlersFor} from '../createHandlers';

import Question from './Question';
import QuestionSet from './QuestionSet';

const AssignmentType = 'application/vnd.nextthought.assessment.assignment';
const TimedAssignmentType = 'application/vnd.nextthought.assessment.timedassignment';
const handlers = [
	Question,
	QuestionSet
];

export default createHandlersFor([AssignmentType, TimedAssignmentType], handlers);
