import EventEmitter from 'events';

import { hideField } from '../mixins/Fields.js';

export class BaseObservable extends EventEmitter {
	constructor() {
		super();

		this.setMaxListeners(100);
		//Make EventEmitter properties non-enumerable
		Object.keys(this).map(key => hideField(this, key));
	}
}
