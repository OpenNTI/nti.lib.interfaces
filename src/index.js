import Interface from './interface/DataServerInterface';
import cache from './utils/datacache';
import Registry from './models/Registry';
import * as Models from './models';

//Main Entry Point:
export default function setup (config) {
	let i = new Interface(config);

	return {
		datacache: cache,
		interface: i
	};
}


export Library from './stores/Library';
export Notifications from './stores/Notifications';
export FiveMinuteEnrollmentInterface from './interface/FiveMinuteInterface';


export * from './constants';
export * as Authoring from './authoring';
export * as Mixins from './mixins';
export * as UserDataThreader from './utils/UserDataThreader';

export { Models };
export function getModel (...args) { return Registry.lookup(...args); }
export function registerModel (o) { return Registry.register(o); }
export getLink from './utils/getlink';
