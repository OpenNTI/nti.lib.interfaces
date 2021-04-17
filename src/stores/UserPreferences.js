import EventEmitter from 'events';

import { decorate, ObjectUtils } from '@nti/lib-commons';
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

				this.#data = await service.getObject(data); //parse
				this.#data.on('change', this.emit.bind(this, 'change'));
				this.emit('change');
			})()
		);
	}

	#data = null;

	async get(key) {
		await this.waitForPending();
		return ObjectUtils.get(this.#data, key);
	}

	set(key, value) {
		if (value !== this.get(key)) {
			ObjectUtils.set(this.#data, key, value);
			// This may not be needed (now that we emit change on model change events)
			this.emit('change', { [key]: value });
		}
	}
}

export default decorate(UserPreferences, {
	with: [mixin(Pendability)],
});
