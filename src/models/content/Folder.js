import FileSystemEntity from './FileSystemEntity';

export default class Folder extends FileSystemEntity {
	static MimeType = 'application/vnd.nextthought.courseware.contentfolder'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
