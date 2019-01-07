import Registry, {COMMON_PREFIX} from './Registry';

export * as annotations from './annotations';
export * as anchors from './anchors';
export * as assessment from './assessment';
export * as calendar from './calendar';
export * as catalog from './catalog';
export * as chat from './chat';
export * as completion from './completion';
export * as content from './content';
export * as courses from './courses';
export * as credit from './credit';
export * as entities from './entities';
export * as forums from './forums';
export * as integrations from './integrations';
export * as invitations from './invitations';
export * as media from './media';
export * as profile from './profile';
export * as reports from './reports';
export * as store from './store';

export Base from './Base';
export AnalyticsSession from './AnalyticsSession';
export Change from './Change';
export Workspace from './Workspace';
export WorkspaceCollection from './WorkspaceCollection';

Registry.ignore('link');

export {
	COMMON_PREFIX
};
