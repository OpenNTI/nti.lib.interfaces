import { placeItemIn, removeItemFrom } from '../place';

const QuestionType = 'application/vnd.nextthought.naquestion';

function getDataForItem(item) {
	return {
		Class: 'AssignmentPart',
		MimeType: 'application/vnd.nextthought.assessment.assignmentpart',
		question_set: {
			Class: 'QuestionSet',
			MimeType: 'application/vnd.nextthought.naquestionset',
			questions: [item.NTIID],
		},
	};
}

export default {
	handles: QuestionType,

	placeItemIn(item, container, scope) {
		//Make sure we don't have the summary
		return container.ensureNotSummary().then(assignment => {
			const { parts } = assignment;
			const part = parts && parts[0]; //For now just use the first part
			const { question_set: questionSet } = part || {};

			return questionSet
				? placeItemIn(item, questionSet, scope)
				: assignment.save({ parts: [getDataForItem(item)] });
		});
	},

	removeItemFrom(item, container, scope) {
		//Make sure we don't have the summary
		return container.ensureNotSummary().then(assignment => {
			const { parts } = assignment;
			//TODO: iterate the parts looking for the questionSet that contains the
			//question
			const part = parts && parts[0]; //For now just use the first part
			const { question_set: questionSet } = part || {};
			let remove;

			//if its the last question in the question set remove the question set
			//from the assignment
			if (questionSet && questionSet.getQuestionCount() === 1) {
				remove = removeItemFrom(questionSet, assignment, scope);
			} else if (questionSet) {
				remove = removeItemFrom(item, questionSet, scope);
			} else {
				remove = Promise.reject('No question set');
			}

			return remove;
		});
	},
};
