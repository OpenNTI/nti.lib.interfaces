import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';

@model
export default class Bookmark extends Base {
	static MimeType = COMMON_PREFIX + 'bookmark';

	static Fields = {
		...Base.Fields,
		sharedWith: { type: 'string[]' },
		prohibitReSharing: { type: 'boolean' },
		applicableRange: { type: 'model' },
		selectedText: { type: 'string' },
	};
}

/**
 *
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'tags', type: 'Auto'},
		{ name: 'selectedText', type: 'string'},
		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
		{ name: 'NotificationGroupingField', mapping: 'CreatedTime', type: 'groupByTime', persist: false, affectedBy: 'CreatedTime'},
		{ name: 'FavoriteGroupingField', defaultValue: 'Bookmarks', persist: false}
 */
