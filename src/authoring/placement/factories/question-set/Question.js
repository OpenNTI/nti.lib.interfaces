import OrderedContents from '../../../ordered-contents';

const QuestionType = 'application/vnd.nextthought.naquestion';

const refresh = (item) => item.refresh().then(() => item.onChange());

export default {
	handles: QuestionType,

	placeItemIn (item, container/*, scope*/) {
		const orderedContents = new OrderedContents(container);

		return orderedContents.append(item)
			.then(() => refresh(item));
	},


	removeItemFrom (item, container/*, scope*/) {
		const orderedContents = new OrderedContents(container);

		return orderedContents.remove(item)
			.then(() => refresh(item));
	}
};
