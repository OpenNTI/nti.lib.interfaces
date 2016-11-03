import OrderedContents from '../../../ordered-contents';

const QuestionType = 'application/vnd.nextthought.naquestion';

export default {
	handles: QuestionType,

	placeItemIn (item, container/*, scope*/) {
		const orderedContents = new OrderedContents(container);

		return orderedContents.append(item);
	},


	removeItemFrom (item, container/*, scope*/) {
		const orderedContents = new OrderedContents(container);

		return orderedContents.remove(item);
	}
};
