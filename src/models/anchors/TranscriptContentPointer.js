import { Parser as parse } from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import TimeContentPointer from './TimeContentPointer';

@model
export default class TranscriptContentPointer extends TimeContentPointer {
	static MimeType = COMMON_PREFIX + 'contentrange.transcriptcontentpointer'

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('pointer');
	}

	getPointer () { return this.pointer; }
	getCueId () { return this.cueid; }
}
