import {EventEmitter} from 'events';

import {Service} from '../../../CommonSymbols';

export default class AssignmentCollectionSummary extends EventEmitter {

	constructor (service, collection, histories) {
		super();
		Object.assign(this, {
			[Service]: service
		});
	}

}
