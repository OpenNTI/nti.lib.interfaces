import Folder from './Folder';

export default class Root extends Folder {
	static MimeType = 'application/vnd.nextthought.resources.courserootfolder'

	isRoot = true

	constructor (service, parent, data) {
		super(service, parent, data);
	}

}
