import Registry from '../Registry.js';

export { default as AssessedPart } from './AssessedPart.js';
export { default as AssessedQuestion } from './AssessedQuestion.js';
export { default as AssessedQuestionSet } from './AssessedQuestionSet.js';
export { default as Hint } from './Hint.js';
export { default as Part } from './Part.js';
export { default as Question } from './Question.js';
export { default as QuestionSet } from './QuestionSet.js';
export { default as QuestionSetReference } from './QuestionSetReference.js';
export { default as QuestionSetSubmission } from './QuestionSetSubmission.js';
export { default as QuestionSubmission } from './QuestionSubmission.js';
export { default as Response } from './Response.js';
export { default as Solution } from './Solution.js';
export { default as WordBank } from './WordBank.js';
export { default as WordEntry } from './WordEntry.js';

export * as parts from './parts/index.js';
export * as assignment from './assignment/index.js';
export * as survey from './survey/index.js';

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
