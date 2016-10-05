import {createHandlersFor} from '../createHandlers';

import Question from './Question';

const AssignmentType = 'application/vnd.nextthought.assessment.assignment';
const TimedAssignmentType = 'application/vnd.nextthought.assessment.timedassignment';
const handlers = [
	Question
];

export default createHandlersFor([AssignmentType, TimedAssignmentType], handlers);
