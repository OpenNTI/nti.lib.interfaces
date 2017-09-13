import {model, COMMON_PREFIX} from '../Registry';

import TimeContentPointer from './TimeContentPointer';

export default
@model
class TranscriptContentPointer extends TimeContentPointer {
	static MimeType = COMMON_PREFIX + 'contentrange.transcriptcontentpointer'

	static Fields = {
		...TimeContentPointer.Fields,
		'cueid':   { type: 'string' },
		'pointer': { type: 'model'  },
	}

	constructor (service, parent, data) {
		super(service, parent, data);
	}

	getPointer () { return this.pointer; }
	getCueId () { return this.cueid; }
}
