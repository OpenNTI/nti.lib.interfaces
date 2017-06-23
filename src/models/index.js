import Registry, {COMMON_PREFIX} from './Registry';

export * as annotations from './annotations';
export * as anchors from './anchors';
export * as assessment from './assessment';
export * as chat from './chat';
export * as content from './content';
export * as courses from './courses';
export * as entities from './entities';
export * as forums from './forums';
export * as media from './media';
export * as profile from './profile';
export * as store from './store';

export Base from './Base';
export Change from './Change';

Registry.ignore('link');

export {
	COMMON_PREFIX
};
