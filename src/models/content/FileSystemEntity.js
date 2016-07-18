import pluck from 'nti-commons/lib/pluck';

import Base from '../Base';
import {NO_LINK} from '../../constants';

//Think of this as an AbstractClass...or a Base class that noone directly instantiates.
export default class FileSystemEntity extends Base {

	constructor (service, parent, data) {
		super (service, parent, data);

		//this.name
		//this.path

		//Known Links:
		//	clear    - Clear directory - remove all items.
		//	contents - List directory.
		//	copy     - duplicate
		//	delete   - remove
		//	export   - download archive of directory
		//	import   - upload an archived directory structure and import it (unzip in place)
		//	mkdir    - make a new child directory
		//	mkdirs   - make all the directories in a path.
		//	move     - move this entry
		//	rename   - rename this entry
		//	tree     - get a tree snapshot view (shallow data)
		//	upload   - upload a file
	}


	can (action) {
		return this.hasLink(action);
	}


	getParentFolder () {
		const parent = this.parent();
		return (parent instanceof FileSystemEntity) ? parent : void parent;
	}


	getContents () {
		return this.fetchLinkParsed('contents');
	}


	getExportDownloadURL () {
		return this.getLink('export');
	}


	/**
	 * @return {string} The url-safe slugified version of the filename.
	 */
	getEntityName () {
		return this.name;
	}


	getFileName () {
		return this.filename || this.name || '?unknown?';
	}


	getPath () {
		return this.path || '/';
	}


	clear () {
		return this.postToLink('clear')
			.catch(er => Promise.reject(er !== NO_LINK ? er
				: Object.assign(new Error(`${this.getFileName()} cannot be cleared.`), {
					code: 'PermissionDeniedNoLink',
					statusCode: 401
				})));
	}


	delete () {
		return this.requestLink('delete', 'delete')
			.catch(er => Promise.reject(er !== NO_LINK ? er
				: Object.assign(new Error(`${this.getFileName()} cannot be deleted.`), {
					code: 'PermissionDeniedNoLink',
					statusCode: 401
				})));
	}


	moveTo (path) {
		let keys = ['NTIID', 'Links', 'filename', 'name', 'path'];
		return this.postToLink('move', {path})
			.then(o => this.refresh(pluck(o, ...keys)))
			.then(() => this.onChange(keys))
			.catch(er => Promise.reject(er !== NO_LINK ? er
				: Object.assign(new Error(`${this.getFileName()} cannot be moved.`), {
					code: 'PermissionDeniedNoLink',
					statusCode: 401
				})));
	}


	rename (newName) {

		let keys = ['NTIID', 'Links', 'filename', 'name', 'path'];

		return this.postToLink('rename', {filename: newName})
			.then(o => this.refresh(pluck(o, ...keys)))
			.then(() => this.onChange(keys))
			.catch(er => Promise.reject(er !== NO_LINK ? er
				: Object.assign(new Error(`${this.getFileName()} cannot be renamed.`), {
					code: 'PermissionDeniedNoLink',
					statusCode: 401
				})));
	}


	mkdir () {
		return this.postToLink('mkdir', {}, true)
		.catch(er => Promise.reject(er !== NO_LINK ? er
			: Object.assign(new Error(`New folders are not permitted under ${this.getFileName()}.`), {
				code: 'PermissionDeniedNoLink',
				statusCode: 401
			})));
	}


}