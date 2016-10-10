const QuestionSetType = 'application/vnd.nextthought.naquestionset';

export default {
	handles: QuestionSetType,

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
