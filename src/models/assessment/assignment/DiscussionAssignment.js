import Assignment from './Assignment';
import {Service} from '../../../constants';

export default class DiscussionAssignment extends Assignment {
	constructor (service, parent, data) {
		super(service, parent, data);
		this.isDiscussion = true;
	}


	get canManuallyEdit () {
		return this[Service].capabilities.canDoAdvancedEditing;
	}
}
