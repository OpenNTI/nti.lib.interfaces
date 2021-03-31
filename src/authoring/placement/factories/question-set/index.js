import { register } from '../registry.js';
import { createScopedHandlers } from '../createHandlers.js';

import Question from './Question.js';

const QuestionSetType = 'application/vnd.nextthought.naquestionset';
const QuestionBankType = 'application/vnd.nextthought.naquestionbank';

const handlers = [Question];

register(createScopedHandlers([QuestionSetType, QuestionBankType], handlers));
