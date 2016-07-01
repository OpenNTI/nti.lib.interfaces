import FileSystemEntity from './FileSystemEntity';


export default class File extends FileSystemEntity {
	static MimeType = 'application/vnd.nextthought.courseware.contentfile'

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
