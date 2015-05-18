import TimeContentPointer from './TimeContentPointer';

import { Parser as parse } from '../../CommonSymbols';

export default class TranscriptContentPointer extends TimeContentPointer {

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('pointer');
		this.seconds = parseInt(data.seconds, 10);
	}

	getPointer() { return this.pointer; }
	getCueId() { return this.cueid; }
}
