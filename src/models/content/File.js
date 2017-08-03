import {model, COMMON_PREFIX} from '../Registry';

import FileSystemEntity from './FileSystemEntity';

export default
@model
class File extends FileSystemEntity {
	static MimeType = [
		COMMON_PREFIX + 'contentfile',
		COMMON_PREFIX + 'contentblobfile',
		COMMON_PREFIX + 'courseware.contentfile',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		//Known Links:
		//	associations - ?
		//	associate    - ?
		//	external     - ?
	}


	getFileMimeType () {
		return this.FileMimeType;
	}


	getFileSize () {
		return this.size;
	}


	getURL () {
		return this.url;
	}


	getURLForDownload () {
		return this['download_url'];
	}
}
