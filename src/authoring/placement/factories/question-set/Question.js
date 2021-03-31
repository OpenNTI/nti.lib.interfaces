import OrderedContents from '../../../ordered-contents/index.js';

const QuestionType = 'application/vnd.nextthought.naquestion';

export default {
	handles: QuestionType,

	placeItemIn(item, container /*, scope*/) {
		const orderedContents = new OrderedContents(container);

		return orderedContents.append(item).catch(reason => {
			//TODO: Revisit the ordered contents to not have to do this...
			delete item.error;
			return Promise.reject(reason);
		});
	},

	removeItemFrom(item, container /*, scope*/) {
		const orderedContents = new OrderedContents(container);

		return orderedContents.remove(item).catch(reason => {
			delete item.error;
			return Promise.reject(reason);
		});
	},
};
