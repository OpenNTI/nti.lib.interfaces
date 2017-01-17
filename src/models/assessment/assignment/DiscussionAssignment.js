import Assignment from './Assignment';

export default class DiscussionAssignment extends Assignment {
	constructor (service, parent, data) {
		super(service, parent, data);
		this.isDiscussion = true;
	}
}
