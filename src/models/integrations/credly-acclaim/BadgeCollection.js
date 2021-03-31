import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Batch from '../../../data-sources/data-types/Batch.js';

class CredlyAcclaimBadgeCollection extends Batch {
	static MimeType = [
		COMMON_PREFIX + 'acclaim.badgecollection',
		COMMON_PREFIX + 'acclaim.awardedbadgecollection', //just use the same class for now, might need to split it out in the future
		COMMON_PREFIX + 'acclaim.courseacclaimbadgecontainer',
	];

	// prettier-ignore
	static Fields = {
		...Batch.Fields,
		'badges_count': {type: 'number', name: 'badgeCount'},
		'current_page': {type: 'number', name: 'currentPage'},
		'total_badges_count': {type: 'number', name: 'totalBadgesCount'},
		'total_pages': {type: 'number', name: 'totalPages'}
	}
}

export default decorate(CredlyAcclaimBadgeCollection, { with: [model] });
