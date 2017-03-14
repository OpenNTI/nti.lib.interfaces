import Interface from './interface/DataServerInterface';
import cache from './utils/datacache';
import {getModelByType as lookup, register} from './models';


export Catalog from './stores/Catalog';
export Library from './stores/Library';
export Notifications from './stores/Notifications';
export FiveMinuteEnrollmentInterface from './interface/FiveMinuteInterface';


export * from './constants';
export * as Mixins from './mixins';
export * as UserDataThreader from './utils/UserDataThreader';


//Main Entry Point:
export default function setup (config) {
	let i = new Interface(config);

	return {
		datacache: cache,
		interface: i
	};
}


export function getModel (...args) { return lookup(...args); }
export function registerModel (o) { return register(o); }
export getLink from './utils/getlink';


//TODO: Move these two exports to:
//TODO:  Authoring.OrderedContents
//TODO:  Authoring.OrderedContents.MoveRoot
//TODO:  Basically, convert this to:
//TODO:    export * as Authoring from './authoring';s
export OrderedContents from './authoring/ordered-contents';
export MoveRoot from './authoring/ordered-contents/MoveRoot';
