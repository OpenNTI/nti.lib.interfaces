import Interface from './interface/DataServerInterface';
import cache from './utils/datacache';
import * as Models from './models';

//Main Entry Point:
export default function setup (config) {
	let i = new Interface(config);

	return {
		datacache: cache,
		interface: i
	};
}


export Catalog from './stores/Catalog';
export Library from './stores/Library';
export Notifications from './stores/Notifications';
export FiveMinuteEnrollmentInterface from './interface/FiveMinuteInterface';


export * as Authoring from './authoring';
export * from './constants';
export * as Mixins from './mixins';
export * as UserDataThreader from './utils/UserDataThreader';

export function getModel (...args) { return Models.Registry.lookup(...args); }
export function registerModel (o) { return Models.Registry.register(o); }
export getLink from './utils/getlink';


//TODO: Move these two exports to:
//TODO:  Authoring.OrderedContents
//TODO:  Authoring.OrderedContents.MoveRoot
export OrderedContents from './authoring/ordered-contents';
export MoveRoot from './authoring/ordered-contents/MoveRoot';
