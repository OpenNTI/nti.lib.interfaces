import Flaggable from '../../mixins/Flaggable.js';
import Threadable from '../../mixins/Threadable.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class MessageInfo extends Flaggable(Threadable(Base)) {
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
}

Registry.register(MessageInfo);
