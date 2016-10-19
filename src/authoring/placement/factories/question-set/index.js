import {createHandlersFor} from '../createHandlers';

import Question from './Question';

const QuestionSetType = 'application/vnd.nextthought.naquestionset';
const handlers = [
	Question
];

export default createHandlersFor(QuestionSetType, handlers);
