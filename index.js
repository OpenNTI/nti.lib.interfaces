import * as CommonSymbols from './CommonSymbols';
import Session from './session';
import Interface from './interface';
import cache from './utils/datacache';
import logger from './logger';

import Catalog from './stores/Catalog';
import Library from './stores/Library';
import Notifications from './stores/Notifications';

import {getModelByType as lookup} from './models';

export default function (config) {
	let i = new Interface(config);

	if (config.silent) {
		logger.quiet();
	}

	return {
		datacache: cache,
		interface: i,
		session: new Session(i)
	};
}

export {CommonSymbols, Catalog, Library, Notifications};

export function getModel (...args) {
	return lookup(...args);
}
