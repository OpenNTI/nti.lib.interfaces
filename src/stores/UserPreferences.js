import EventEmitter from 'events';

import { decorate, ObjectUtils } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Mixin as Pendability } from '../mixins/Pendability.js';
import Base from '../models/Base.js';

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

	async fetch(key) {
		await this.waitForPending();
		return this.get(key);
	}

	get(key) {
		return ObjectUtils.get(this.#data, key);
	}

	set(key, value) {
		// flatten objects
		if (typeof value === 'object' && !(value instanceof Base)) {
			for (const prop of Object.keys(value)) {
				this.set(key + '.' + prop, value[prop]);
			}
			return;
		}

		if (value !== this.get(key)) {
			ObjectUtils.set(this.#data, key, value);
			// This may not be needed (now that we emit change on model change events)
			this.emit('change', { [key]: value });
		}
	}
}

export default decorate(UserPreferences, [mixin(Pendability)]);
