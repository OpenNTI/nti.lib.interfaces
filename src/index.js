import Interface from './interface/DataServerInterface.js';
import cache from './utils/data-cache.js';
import Registry from './models/Registry.js';
import * as Models from './models/index.js';

//Main Entry Point:
export default function setup(config) {
	let i = new Interface(config);

	return {
		datacache: cache,
		interface: i,
	};
}

export { default as Library } from './stores/Library.js';
export { default as Notifications } from './stores/Notifications.js';
export { default as UserPresence } from './stores/UserPresence.js';
export { default as ServiceDocument } from './stores/Service.js';
export { default as FiveMinuteEnrollmentInterface } from './interface/FiveMinuteInterface.js';

export * from './constants.js';
export * as Authoring from './authoring/index.js';
export * as UserDataThreader from './utils/UserDataThreader.js';
export * as Tasks from './tasks/index.js';

export { default as Batch } from './data-sources/data-types/Batch.js';

export { Models };
export function getModel(...args) {
	return Registry.lookup(...args);
}
export function registerModel(o) {
	return Registry.register(o);
}
export { default as getLink } from './utils/get-link.js';
