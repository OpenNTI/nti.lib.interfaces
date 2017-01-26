import Interface from './interface/DataServerInterface';
import FiveMinuteEnrollmentInterface from './interface/FiveMinuteInterface';
import cache from './utils/datacache';

import Catalog from './stores/Catalog';
import Library from './stores/Library';
import Notifications from './stores/Notifications';

import {getModelByType as lookup, register} from './models';

export * from './constants';
export * as Mixins from './mixins';

export default function (config) {
	let i = new Interface(config);

	return {
		datacache: cache,
		interface: i
	};
}

export {
	Catalog,
	Library,
	Notifications,

	FiveMinuteEnrollmentInterface
};

export function getModel (...args) {
	return lookup(...args);
}

export function registerModel (o) {
	return register(o);
}

export getLink from './utils/getlink';

export OrderedContents from './authoring/ordered-contents';
export MoveRoot from './authoring/ordered-contents/MoveRoot';
