import Highlight from './Highlight';

import Threadable from '../mixins/Threadable';

export default class Note extends Highlight {

	constructor (service, parent, data, ...mixins) {
		super(service, parent, data, Threadable, ...mixins);
	}

	get replyCount () {
		//TODO: once children are loaded and threaded read that count.
		return this.ReferencedByCount;
	}

}
