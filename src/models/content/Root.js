import Registry, { COMMON_PREFIX } from '../Registry.js';

import Folder from './Folder.js';

export default class Root extends Folder {
	static MimeType = [
		COMMON_PREFIX + 'contentrootfolder',
		COMMON_PREFIX + 'courserootfolder',
		COMMON_PREFIX + 'resources.courserootfolder',
	];

	isRoot = true;
}

Registry.register(Root);
