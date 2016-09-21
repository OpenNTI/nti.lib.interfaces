import Assignment from './Assignment';

const OverviewGroup = 'application/vnd.nextthought.nticourseoverviewgroup';

const ITEM_TYPES = [
	Assignment
];

export default {
	type: OverviewGroup,

	placeItemInParent (item, parent, scope) {
		const type = item.MimeType;

		for (let itemType of ITEM_TYPES) {
			if (itemType.type === type) {
				return itemType.placeItemInParent(item, parent, scope);
			}
		}

		return Promise.reject('No handler for item');
	}
};
