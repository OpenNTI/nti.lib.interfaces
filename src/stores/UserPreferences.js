import EventEmitter from 'events';

import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Mixin as InstanceCacheContainer } from '../mixins/InstanceCacheContainer.js';
import { Mixin as Pendability } from '../mixins/Pendability.js';

class UserPreferences extends EventEmitter {
	constructor(service) {
		super();
		this.service = service;
	}

	#librarySort = {};

	getLibrarySort(collectionName) {
		return this.#librarySort[collectionName];
	}

	setLibrarySort(collectionName, sortOn, sortDirection = 'ascending') {
		this.#librarySort[collectionName] = {
			sortOn,
			sortDirection,
		};
	}
}

export default decorate(UserPreferences, {
	with: [mixin(Pendability, InstanceCacheContainer)],
});
