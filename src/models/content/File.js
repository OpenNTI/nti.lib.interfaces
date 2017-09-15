import {model, COMMON_PREFIX} from '../Registry';

import FileSystemEntity from './FileSystemEntity';

//Known Links:
//	associations - ?
//	associate    - ?
//	external     - ?

export default
@model
class File extends FileSystemEntity {
	static MimeType = [
		COMMON_PREFIX + 'contentfile',
		COMMON_PREFIX + 'contentblobfile',
		COMMON_PREFIX + 'courseware.contentfile',
	]

	static Fields = {
		...FileSystemEntity.Fields,
		'download_url': { type: 'string' },
		'size':         { type: 'number' },
		'url':          { type: 'string' },
		'FileMimeType': { type: 'string' },
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
