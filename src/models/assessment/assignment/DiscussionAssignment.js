import {Service} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';

import Assignment from './Assignment';

@model
export default class DiscussionAssignment extends Assignment {
	static MimeType = COMMON_PREFIX + 'assessment.discussionassignment'

	constructor (service, parent, data) {
		super(service, parent, data);
		this.isDiscussion = true;
	}


	get canManuallyEdit () {
		return this[Service].capabilities.canDoAdvancedEditing;
	}


	resolveTopic (user) {
		const params = user ? {user} : {};

		return this.fetchLinkParsed('ResolveTopic', params);
	}
}
