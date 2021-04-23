import { decorate } from '@nti/lib-commons';

import { Service } from '../../../constants.js';
import { model, COMMON_PREFIX } from '../../Registry.js';

import Assignment from './Assignment.js';

class DiscussionAssignment extends Assignment {
	static MimeType = COMMON_PREFIX + 'assessment.discussionassignment';

	isDiscussion = true;

	get canManuallyEdit() {
		return this[Service].capabilities.canDoAdvancedEditing;
	}

	resolveTopic(user) {
		const params = user ? { user } : {};

		return this.fetchLinkParsed('ResolveTopic', params);
	}
}

export default decorate(DiscussionAssignment, [model]);
