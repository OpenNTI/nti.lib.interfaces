import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import TimeContentPointer from './TimeContentPointer.js';

class TranscriptContentPointer extends TimeContentPointer {
	static MimeType = COMMON_PREFIX + 'contentrange.transcriptcontentpointer';

	// prettier-ignore
	static Fields = {
		...TimeContentPointer.Fields,
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

export default decorate(TranscriptContentPointer, [model]);
