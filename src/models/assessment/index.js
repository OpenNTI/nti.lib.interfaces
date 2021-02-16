import Registry from '../Registry';

export { default as AssessedPart } from './AssessedPart';
export { default as AssessedQuestion } from './AssessedQuestion';
export { default as AssessedQuestionSet } from './AssessedQuestionSet';
export { default as Hint } from './Hint';
export { default as Part } from './Part';
export { default as Question } from './Question';
export { default as QuestionSet } from './QuestionSet';
export { default as QuestionSetReference } from './QuestionSetReference';
export { default as QuestionSetSubmission } from './QuestionSetSubmission';
export { default as QuestionSubmission } from './QuestionSubmission';
export { default as Response } from './Response';
export { default as Solution } from './Solution';
export { default as WordBank } from './WordBank';
export { default as WordEntry } from './WordEntry';

export * as parts from './parts';
export * as assignment from './assignment';
export * as survey from './survey';

Registry.ignore('assessment.questionbank');
Registry.ignore('assessment.questionmap');

Registry.alias(
	'assessment.solution',
	'assessment.fillintheblankshortanswersolution'
);
Registry.alias(
	'assessment.solution',
	'assessment.fillintheblankwithwordbanksolution'
);
Registry.alias('assessment.solution', 'assessment.freeresponsesolution');
Registry.alias('assessment.solution', 'assessment.latexsymbolicmathsolution');
Registry.alias('assessment.solution', 'assessment.matchingsolution');
Registry.alias('assessment.solution', 'assessment.mathsolution');
Registry.alias(
	'assessment.solution',
	'assessment.multiplechoicemultipleanswersolution'
);
Registry.alias('assessment.solution', 'assessment.multiplechoicesolution');
Registry.alias('assessment.solution', 'assessment.numericmathsolution');
Registry.alias('assessment.solution', 'assessment.orderingsolution');
Registry.alias('assessment.solution', 'assessment.symbolicmathsolution');
