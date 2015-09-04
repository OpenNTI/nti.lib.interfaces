import Topic from './Topic';

import {isNTIID} from '../../utils/ntiids';

export default class BlogEntry extends Topic {
	constructor (service, parent, data) {
		super(service, parent, data);

		if (this.hasLink('unpublish')) {
			this.sharedWith = this.tags.filter(isNTIID);
			this.tags = this.tags.filter(x => !isNTIID(x));
		}
	}


	share (publish, others) {

		


		// {sharedWith:
		return this.postToLink('publish');
	}
}
