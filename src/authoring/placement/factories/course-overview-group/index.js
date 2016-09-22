import Assignment from './Assignment';

const OverviewGroup = 'application/vnd.nextthought.nticourseoverviewgroup';

const ITEM_TYPES = [
	Assignment
];

export default {
	type: OverviewGroup,

	placeItemIn (item, container, scope) {
		const type = item.MimeType;

		for (let itemType of ITEM_TYPES) {
			if (itemType.type === type) {
				return itemType.placeItemIn(item, container, scope);
			}
		}

		return Promise.reject('No handler for item');
	}
};
