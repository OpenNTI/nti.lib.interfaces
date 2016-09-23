import Assignment from './Assignment';

const ContentNodeType = 'application/vnd.nextthought.courses.courseoutlinecontentnode';

const ITEM_TYPES = [
	Assignment
];

export default {
	type: ContentNodeType,

	placeItemIn (item, container, scope) {
		const type = item.MimeType;

		for (let itemType of ITEM_TYPES) {
			if (itemType.type === type) {
				return itemType.placeItemIn(item, container, scope);
			}
		}

		return Promise.reject('No handler for item');
	},


	removeItemFrom (item, container, scope) {
		const type = item.MimeType;

		for (let itemType of ITEM_TYPES) {
			if (itemType.type === type) {
				return itemType.removeItemFrom(item, container, scope);
			}
		}

		return Promise.reject('No handler for item');
	}
};
