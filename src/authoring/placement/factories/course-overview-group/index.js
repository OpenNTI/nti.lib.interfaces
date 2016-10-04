import {Handlers} from 'nti-commons';

import Assignment from './Assignment';

const OverviewGroup = 'application/vnd.nextthought.nticourseoverviewgroup';

const ITEM_TYPES = new Handlers([
	Assignment
]);

export default {
	handles: OverviewGroup,

	placeItemIn (item, container, scope) {
		const handler = ITEM_TYPES.getHandlerFor(item);

		return handler ? handler.placeItemIn(item, container, scope) : Promise.reject('No Handler for item');
	},


	removeItemFrom (item, container, scope) {
		const handler = ITEM_TYPES.getHandlerFor(item);

		return handler ? handler.removeItemFrom(item, container, scope) : Promise.reject('No Handler for item');
	}
};
