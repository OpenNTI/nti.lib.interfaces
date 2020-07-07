import {decorate} from '@nti/lib-commons';

import {Service} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';

import Assignment from './Assignment';

class DiscussionAssignment extends Assignment {
	static MimeType = COMMON_PREFIX + 'assessment.discussionassignment'

	isDiscussion = true


	get canManuallyEdit () {
		return this[Service].capabilities.canDoAdvancedEditing;
	}


	resolveTopic (user) {
		const params = user ? {user} : {};

		return this.fetchLinkParsed('ResolveTopic', params);
	}
}

export default decorate(DiscussionAssignment, {with:[model]});
