import FileSystemEntity from './FileSystemEntity';
import {Service, ReParent} from '../../constants';

export default class Folder extends FileSystemEntity {
	static MimeType = 'application/vnd.nextthought.courseware.contentfolder'
	get isFolder () { return true; }

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	/**
	 * Client Side only. (used for UI optimistically faking out loads)
	 *
	 * if the object passed is not a FileSystemEntity, make it so.
	 *
	 * adopt the file into this folder.
	 *
	 * @param {object|File} file The file, raw or instance.
	 * @returns {File} swizzled object.
	 */
	castFile (file) {
		if (file && !(file instanceof FileSystemEntity)) {
			file = this[Service].getObject(file, this);
		}

		if (file && file[ReParent]) {
			file[ReParent](this);
		}


		return file;
	}

}
