import Logger from '@nti/util-logger';
import {mixin} from '@nti/lib-decorators';

import { Service, Parser as parse } from '../../constants';
import Threadable from '../../mixins/Threadable';
import {model, COMMON_PREFIX} from '../Registry';

import Highlight from './Highlight';

const logger = Logger.get('models:annotations:Note');

export default
@model
@mixin(Threadable)
class Note extends Highlight {
	static MimeType = COMMON_PREFIX + 'note'

	static Fields = {
		...Highlight.Fields,
		'body':                   { type: '*[]'      },
		'inReplyTo':              { type: 'string'   },
		'references':             { type: 'string[]' },
		'ReferencedByCount':      { type: 'number'   },
		'LikeCount':              { type: 'number'   },
		'title':                  { type: 'string'   },
		'presentationProperties': { type: 'object'   },
		'style':                  { type: 'string'   },
		'Class':                  { type: 'string'   }
	}

	isNote = true

	get replyCount () {
		// Rely on this value, placeholders will have a getter for the ReferencedByCount property.
		return this.ReferencedByCount;
	}

	canReply (tryScopes = []) {
		return !!(this[Service].getCollectionFor(this, null, tryScopes) || {}).href;
	}

	postReply (body, tryScopes = []) {
		let service = this[Service];
		let target = (service.getCollectionFor(this, null, tryScopes) || {}).href;
		if (!target) {
			logger.error('Nowhere to save object: %o', this);
		}

		if (!Array.isArray(body)) {
			body = [body];
		}

		return new Promise(save => {

			let reply = new Note(service, this, {
				Class: 'Note',
				MimeType: Note.MimeType,
				body,
				ContainerId: this.ContainerId,
				applicableRange: this.applicableRange && this.applicableRange.getData(),
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
