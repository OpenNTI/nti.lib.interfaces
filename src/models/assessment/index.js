import Registry from '../Registry';

import './AssessedPart';
import './AssessedQuestion';
import './AssessedQuestionSet';
import './Hint';
import './Part';
import './Question';
import './QuestionSet';
import './QuestionSetReference';
import './QuestionSetSubmission';
import './QuestionSubmission';
import './Response';
import './Solution';
import './WordBank';
import './WordEntry';

import './parts';
import './assignment';
import './survey';


Registry.ignore('assessment.questionbank');
Registry.ignore('assessment.questionmap');

Registry.alias('assessment.solution', 'assessment.fillintheblankshortanswersolution');
Registry.alias('assessment.solution', 'assessment.fillintheblankwithwordbanksolution');
Registry.alias('assessment.solution', 'assessment.freeresponsesolution');
Registry.alias('assessment.solution', 'assessment.latexsymbolicmathsolution');
Registry.alias('assessment.solution', 'assessment.matchingsolution');
Registry.alias('assessment.solution', 'assessment.mathsolution');
Registry.alias('assessment.solution', 'assessment.multiplechoicemultipleanswersolution');
Registry.alias('assessment.solution', 'assessment.multiplechoicesolution');
Registry.alias('assessment.solution', 'assessment.numericmathsolution');
Registry.alias('assessment.solution', 'assessment.orderingsolution');
Registry.alias('assessment.solution', 'assessment.symbolicmathsolution');
