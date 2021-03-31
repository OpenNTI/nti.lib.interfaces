import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import Folder from './Folder.js';

class Root extends Folder {
	static MimeType = [
		COMMON_PREFIX + 'contentrootfolder',
		COMMON_PREFIX + 'courserootfolder',
		COMMON_PREFIX + 'resources.courserootfolder',
	];

	isRoot = true;
}

export default decorate(Root, { with: [model] });
