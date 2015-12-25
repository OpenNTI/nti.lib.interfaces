import { Service, Parser as parse } from '../../constants';

import Highlight from './Highlight';

import Threadable from '../mixins/Threadable';

export default class Note extends Highlight {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, Threadable, ...mixins);
	}

	get replyCount () {
		// Rely on this value, placeholders will have a getter for the ReferencedByCount property.
		return this.ReferencedByCount;
	}


	postReply (body, tryScopes = []) {
		let service = this[Service];
		let target = (service.getCollectionFor(this, null, tryScopes) || {}).href;
		if (!target) {
			console.error('No where to save object: %o', this);
		}

		if (!Array.isArray(body)) {
			body = [body];
		}

		return new Promise(save => {

			let reply = new Note(service, this, {
				Class: 'Note',
				MimeType: 'application/vnd.nextthought.note',
				body,
				ContainerId: this.ContainerId,
				applicableRange: this.applicableRange,
				inReplyTo: this.getID(),
				references: (this.references || []).slice().concat(this.getID())
			});

			save(reply);
		})
			.then(reply => service.post(target, reply.getData()))
			.then(data => this[parse](data))
			.then(reply => {
				this.appendNewChild(reply);
				this.emit('change');
			});
	}
}
