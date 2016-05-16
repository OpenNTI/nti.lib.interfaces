import Session from './session';
import Interface from './interface';
import cache from './utils/datacache';

import Catalog from './stores/Catalog';
import Library from './stores/Library';
import Notifications from './stores/Notifications';

import {getModelByType as lookup} from './models';

export * from './constants';

export default function (config) {
	let i = new Interface(config);

	return {
		datacache: cache,
		interface: i,
		session: new Session(i)
	};
}

export {
	Catalog,
	Library,
	Notifications
};

export function getModel (...args) {
	return lookup(...args);
}
