import {createHandlersFor} from '../createHandlers';

import Question from './Question';

const QuestionSetType = 'application/vnd.nextthought.naquestionset';
const QuestionBankType = 'application/vnd.nextthought.naquestionbank';

const handlers = [
	Question
];

export default createHandlersFor([QuestionSetType, QuestionBankType], handlers);
