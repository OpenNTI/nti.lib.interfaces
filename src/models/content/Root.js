import {model, COMMON_PREFIX} from '../Registry';

import Folder from './Folder';

export default
@model
class Root extends Folder {
	static MimeType = [
		COMMON_PREFIX + 'contentrootfolder',
		COMMON_PREFIX + 'courserootfolder',
		COMMON_PREFIX + 'resources.courserootfolder',
	]

	isRoot = true
}
