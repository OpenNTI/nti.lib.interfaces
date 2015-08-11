import TimeContentPointer from './TimeContentPointer';

import { Parser as parse } from '../../CommonSymbols';

export default class TranscriptContentPointer extends TimeContentPointer {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, {Class: 'TranscriptContentPointer'}, ...mixins);
		this[parse]('pointer');
	}

	getPointer () { return this.pointer; }
	getCueId () { return this.cueid; }
}
