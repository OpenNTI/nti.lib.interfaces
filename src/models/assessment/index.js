import Registry from '../Registry';

export AssessedPart from './AssessedPart';
export AssessedQuestion from './AssessedQuestion';
export AssessedQuestionSet from './AssessedQuestionSet';
export Hint from './Hint';
export Part from './Part';
export Question from './Question';
export QuestionSet from './QuestionSet';
export QuestionSetReference from './QuestionSetReference';
export QuestionSetSubmission from './QuestionSetSubmission';
export QuestionSubmission from './QuestionSubmission';
export Response from './Response';
export Solution from './Solution';
export WordBank from './WordBank';
export WordEntry from './WordEntry';

export * as parts from './parts';
export * as assignment from './assignment';
export * as survey from './survey';


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
