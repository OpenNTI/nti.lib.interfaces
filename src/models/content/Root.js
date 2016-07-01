import FileSystemEntity from './FileSystemEntity';

export default class Root extends FileSystemEntity {
	static MimeType = 'application/vnd.nextthought.resources.courserootfolder'

	constructor (service, parent, data) {
		super(service, parent, data);
	}

}
