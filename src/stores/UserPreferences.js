import EventEmitter from 'events';

import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Mixin as Pendability } from '../mixins/Pendability.js';

class UserPreferences extends EventEmitter {
	constructor(service) {
		super();
		this.service = service;

		this.addToPending(
			(async () => {
				const user = encodeURIComponent(service.getAppUsername());
				const data = await service.get(
					`users/${user}/++preferences++/`
				);

				this.preferences = await service.getObject(data); //parse
			})()
		);
	}

	#data = {};

	get(key) {
		return this.#data[key];
	}

	set(key, value) {
		if (value !== this.get(key)) {
			this.#data[key] = value;
			this.emit('change', { [key]: value });
		}
	}
}

export default decorate(UserPreferences, {
	with: [mixin(Pendability)],
});
