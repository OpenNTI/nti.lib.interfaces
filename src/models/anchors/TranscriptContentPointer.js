import Registry, { COMMON_PREFIX } from '../Registry.js';

import TimeContentPointer from './TimeContentPointer.js';

export default class TranscriptContentPointer extends TimeContentPointer {
	static MimeType = COMMON_PREFIX + 'contentrange.transcriptcontentpointer';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'cueid':   { type: 'string' },
		'pointer': { type: 'model'  },
	}

	constructor(service, parent, data) {
		super(service, parent, data);
	}

	getPointer() {
		return this.pointer;
	}
	getCueId() {
		return this.cueid;
	}
}

Registry.register(TranscriptContentPointer);
