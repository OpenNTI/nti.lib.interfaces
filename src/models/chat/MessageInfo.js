import { pluck } from '@nti/lib-commons';

import { NO_LINK } from '../../constants.js';
import Threadable from '../../mixins/Threadable.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class MessageInfo extends Threadable(Base) {
	static MimeType = COMMON_PREFIX + 'messageinfo';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ContainerId': { type: 'string' },
		'ID':          { type: 'string' },
		'Status':      { type: 'string' },
		'body':        { type: '*[]'    },
		'channel':     { type: 'string' },
		'inReplyTo':   { type: 'string' },
		'recipients':  { type: 'string[]' },
		'sharedWith':  { type: 'string[]' },
	}

	async flag() {
		let link = this.hasLink('flag')
			? 'flag'
			: this.hasLink('flag.metoo')
			? 'flag.metoo'
			: null;

		if (!link) {
			throw new Error(NO_LINK);
		}

		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links')))
			.then(() => this.onChange('flag'));
	}
}

Registry.register(MessageInfo);
