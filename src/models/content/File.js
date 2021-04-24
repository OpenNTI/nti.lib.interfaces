import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';

import FileSystemEntity from './FileSystemEntity.js';

//Known Links:
//	associations - ?
//	associate    - ?
//	external     - ?

class File extends FileSystemEntity {
	static MimeType = [
		COMMON_PREFIX + 'contentfile',
		COMMON_PREFIX + 'contentblobfile',
		COMMON_PREFIX + 'courseware.contentfile',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'download_url': { type: 'string' },
		'size':         { type: 'number' },
		'url':          { type: 'string' },
		'FileMimeType': { type: 'string' },
	}

	getFileMimeType() {
		return this.FileMimeType;
	}

	getFileSize() {
		return this.size;
	}

	getURL() {
		return this.url;
	}

	getURLForDownload() {
		return this['download_url'];
	}
}

export default decorate(File, [model]);
