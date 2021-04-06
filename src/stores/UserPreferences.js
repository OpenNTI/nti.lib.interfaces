import EventEmitter from 'events';

import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Mixin as Pendability } from '../mixins/Pendability.js';

class UserPreferences extends EventEmitter {
	constructor(service) {
		super();
		this.service = service;
	}

	#data = {};

	get(key) {
		return this.#data[key];
	}

	set(key, value) {
		this.#data[key] = value;
	}
}

export default decorate(UserPreferences, {
	with: [mixin(Pendability)],
});
