import {model, COMMON_PREFIX} from '../Registry';

import Folder from './Folder';

@model
export default class Root extends Folder {
	static MimeType = [
		COMMON_PREFIX + 'contentrootfolder',
		COMMON_PREFIX + 'courserootfolder',
		COMMON_PREFIX + 'resources.courserootfolder',
	]

	isRoot = true

	constructor (service, parent, data) {
		super(service, parent, data);
	}

}
