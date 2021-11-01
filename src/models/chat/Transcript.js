import { thread } from '../../utils/UserDataThreader.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class Transcript extends Base {
	static MimeType = COMMON_PREFIX + 'transcript';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Messages':     { type: 'model[]',  name: 'messages'     },
		'RoomInfo':     { type: 'model'                          },
		'Contributors': { type: 'string[]', name: 'contributors' },
	};

	constructor(service, parent, data) {
		super(service, parent, data);

		if (this.messages) {
			this.messages = thread(this.Messages).sort(
				(a, b) => a.getCreatedTime() - b.getCreatedTime()
			);
		}
	}

	get startTime() {
		return this.RoomInfo.getCreatedTime();
	}

	get messageCount() {
		return this.RoomInfo.messageCount;
	}

	get originator() {
		let ri = this.RoomInfo;
		return (ri || this).creator;
	}

	get contributorsWithoutOriginator() {
		let { contributors, originator } = this;
		return contributors.filter(x => x !== originator);
	}
}

Registry.register(Transcript);
