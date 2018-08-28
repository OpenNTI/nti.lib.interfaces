import { model, COMMON_PREFIX } from '../Registry';

import Annotation from './Annotation';

export default
@model
class Bookmark extends Annotation {
	static MimeType = COMMON_PREFIX + 'bookmark';

	static Fields = {
		...Annotation.Fields,
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
