const QuestionSetType = 'application/vnd.nextthought.naquestionset';
const QuestionBankType = 'application/vnd.nextthought.naquestionbank';

export default {
	handles: [QuestionSetType, QuestionBankType],

	removeItemFrom (item, container/*, scope*/) {
		return container.ensureNotSummary()
			.then((assignment) => {
				const {parts} = assignment;

				return assignment.save({
					parts: parts.filter(part => part.question_set.NTIID !== item.NTIID)
				});
			})
			.then(() => {
				item.delete();
			});
	}
};
