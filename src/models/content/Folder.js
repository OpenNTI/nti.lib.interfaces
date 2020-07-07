import {decorate} from '@nti/lib-commons';

import {Service} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import FileSystemEntity, {validateSortObject} from './FileSystemEntity';

class Folder extends FileSystemEntity {
	static MimeType = [
		COMMON_PREFIX + 'contentfolder',
		COMMON_PREFIX + 'courseware.contentfolder',
	]

	isFolder = true

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
			file = this[Service].getObject(file, {parent: this});
		}

		if (file && file.reparent) {
			file.reparent(this);
		}


		return file;
	}


	search (query, sort, recursive) {
		//backwards compatibility (delete after next release)
		if (typeof sort === 'boolean') {
			recursive = sort;
			sort = void 0;
		}

		sort = validateSortObject(sort) || {};
		const additional = recursive ? {recursive: true, ...sort} : sort;

		return this.fetchLinkParsed('search', {name: query, ...additional});
	}

}

export default decorate(Folder, {with:[model]});
