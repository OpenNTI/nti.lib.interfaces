import Registry, { COMMON_PREFIX } from './Registry.js';

export * as annotations from './annotations/index.js';
export * as anchors from './anchors/index.js';
export * as assessment from './assessment/index.js';
export * as calendar from './calendar/index.js';
export * as catalog from './catalog/index.js';
export * as chat from './chat/index.js';
export * as completion from './completion/index.js';
export * as constraints from './constraints/index.js';
export * as content from './content/index.js';
export * as courses from './courses/index.js';
export * as credit from './credit/index.js';
export * as entities from './entities/index.js';
export * as forums from './forums/index.js';
export * as integrations from './integrations/index.js';
export * as invitations from './invitations/index.js';
export * as library from './library/index.js';
export * as media from './media/index.js';
export * as preferences from './preferences/index.js';
export * as profile from './profile/index.js';
export * as reports from './reports/index.js';
export * as store from './store/index.js';

export { default as Base } from './Base.js';
export { default as AnalyticsSession } from './AnalyticsSession.js';
export { default as Change } from './Change.js';
export { default as Workspace } from './Workspace.js';
export { default as WorkspaceCollection } from './WorkspaceCollection.js';
export { default as CourseCollection } from './CourseCollection.js';

Registry.ignore('link');

export { COMMON_PREFIX };
