import FileSystemEntity from './FileSystemEntity';

export default class Root extends FileSystemEntity {
	static MimeType = 'application/vnd.nextthought.resources.courserootfolder'
	get isFolder () { return true; }

	constructor (service, parent, data) {
		super(service, parent, data);
	}

}
