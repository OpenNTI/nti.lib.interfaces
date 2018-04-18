import {isNTIID} from '@nti/lib-ntiids';

import {model, COMMON_PREFIX} from '../Registry';

import Topic from './Topic';


export default
@model
class BlogEntry extends Topic {
	static MimeType = COMMON_PREFIX + 'forums.personalblogentry'

	static Fields = {
		...Topic.Fields,
		'sharedWith': { type: 'string[]' },
		'tags':       { type: 'string[]' },
	}

	constructor (service, parent, data) {
		super(service, parent, data);
		this.handleSharingMappings();
	}


	get isPublished () {
		return this.hasLink('unpublish');
	}


	share (publish, specificallyShareTo) {
		let workflow = Promise.resolve();
		let {isPublished, sharedWith = [], tags = []} = this;

		//if specificallyShareTo is set, it replaces the current sharedWith value.
		if (specificallyShareTo != null) {
			sharedWith = specificallyShareTo;
		}

		//if we are changing the state of publish, do that now.
		if (isPublished !== publish) {
			workflow = this.postToLink(`${publish ? '' : 'un'}publish`);
		}

		//If we are publishing, merge sharedWith and tags, and void out sharedWith.
		if (publish) {
			tags = Array.from(new Set([...tags, ...sharedWith]));
			sharedWith = void 0;
		}


		return workflow
			.then(()=> this.save(
				{sharedWith, tags},
				()=> this.handleSharingMappings()
			));
	}



	handleSharingMappings () {
		const {tags = [], sharedWith = []} = this;

		//Get all the NTIID-like tags.
		let taggedEntities = [];
		//and filter them out of the `tags` list. (put them in the taggedEntities list)
		this.tags = tags.filter(x =>
			//test if 'x' is an NTIID...
			isNTIID(x)
				// if so, we will push it into taggedEntities, and force
				// the return value to be false (so that Array#filter will not
				// include it in the resultant list)
				? (taggedEntities.push(x) && false)
				//Otherwise, return true
				: true);

		// If this entry is published (has the link 'unpublish') then the sharedWith list
		// is currently meaningless (to the client)...so just replace it with the taggedEntities.
		if (this.isPublished) {
			this.sharedWith = taggedEntities;

		} else {
			//Otherwise, merge sharedWith and taggedEntities together.
			this.sharedWith = Array.from(new Set([...sharedWith, ...taggedEntities]));
		}
	}
}
