import {Handlers} from 'nti-commons';

import Assignment from './Assignment';

const ContentNodeType = 'application/vnd.nextthought.courses.courseoutlinecontentnode';

const ITEM_TYPES = new Handlers([
	Assignment
]);

export default {
	handles: ContentNodeType,

	placeItemIn (item, container, scope) {
		const handler = ITEM_TYPES.getHandlerFor(item);

		return handler ? handler.placeItemIn(item, container, scope) : Promise.reject('No Handler for Item');
	},


	removeItemFrom (item, container, scope) {
		const handler = ITEM_TYPES.getHandlerFor(item);

		return handler ? handler.removeItemFrom(item, container, scope) : Promise.reject('No Handler for Item');
	}
};
