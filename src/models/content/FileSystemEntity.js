import { pluck } from '@nti/lib-commons';

import Base from '../Model.js';
import { NO_LINK } from '../../constants.js';

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

//Think of this as an AbstractClass...or a Base class that noone directly instantiates.
export default class FileSystemEntity extends Base {
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'filename': { type: 'string' },
		'name':     { type: 'string' },
		'path':     { type: 'string' },
	};

	can(action) {
		return this.hasLink(action);
	}

	getParentFolder() {
		const parent = this.parent();
		return parent instanceof FileSystemEntity ? parent : void parent;
	}

	getContents(sort) {
		sort = validateSortObject(sort);

		return this.fetchLink({ rel: 'contents', params: sort });
	}

	getExportDownloadURL() {
		return this.getLink('export');
	}

	/**
	 * @returns {string} The url-safe slugified version of the filename.
	 */
	getEntityName() {
		return this.name;
	}

	getFileName() {
		return this.filename || this.name || '?unknown?';
	}

	getPath() {
		return this.path || '/';
	}

	clear() {
		return this.fetchLink({
			method: 'post',
			mode: 'raw',
			rel: 'clear',
		}).catch(er =>
			Promise.reject(
				er.message !== NO_LINK
					? er
					: Object.assign(
							new Error(
								`${this.getFileName()} cannot be cleared.`
							),
							{
								code: 'PermissionDeniedNoLink',
								statusCode: 401,
							}
					  )
			)
		);
	}

	delete() {
		return this.deleteLink('delete').catch(er =>
			Promise.reject(
				er.message !== NO_LINK
					? er
					: Object.assign(
							new Error(
								`${this.getFileName()} cannot be deleted.`
							),
							{
								code: 'PermissionDeniedNoLink',
								statusCode: 401,
							}
					  )
			)
		);
	}

	moveTo(path) {
		let keys = [
			'NTIID',
			'Last Modified',
			'Links',
			'filename',
			'name',
			'path',
		];
		return this.fetchLink({
			method: 'post',
			mode: 'raw',
			rel: 'move',
			data: { path },
		})
			.then(o => this.refresh(pluck(o, ...keys)))
			.then(() => this.onChange(keys))
			.catch(er =>
				Promise.reject(
					er.message !== NO_LINK
						? er
						: Object.assign(
								new Error(
									`${this.getFileName()} cannot be moved.`
								),
								{
									code: 'PermissionDeniedNoLink',
									statusCode: 401,
								}
						  )
				)
			);
	}

	rename(newName) {
		let keys = [
			'NTIID',
			'Last Modified',
			'Links',
			'filename',
			'name',
			'path',
		];

		return this.fetchLink({
			method: 'post',
			mode: 'raw',
			rel: 'rename',
			data: { filename: newName },
		})
			.then(o => this.refresh(pluck(o, ...keys)))
			.then(() => this.onChange(keys))
			.catch(er =>
				Promise.reject(
					er.message !== NO_LINK
						? er
						: Object.assign(
								new Error(
									`${this.getFileName()} cannot be renamed.`
								),
								{
									code: 'PermissionDeniedNoLink',
									statusCode: 401,
								}
						  )
				)
			);
	}

	mkdir() {
		return this.fetchLink({
			method: 'post',
			rel: 'mkdir',
			data: {},
		}).catch(er =>
			Promise.reject(
				er.message !== NO_LINK
					? er
					: Object.assign(
							new Error(
								`New folders are not permitted under ${this.getFileName()}.`
							),
							{
								code: 'PermissionDeniedNoLink',
								statusCode: 401,
							}
					  )
			)
		);
	}
}

export function validateSortObject(sort) {
	let { sortOn, sortOrder } = sort || {};

	if (typeof sortOn === 'string' && typeof sortOrder === 'string') {
		//The server only looks for 'ascending'...all other values it treats as descending.
		//we want to allow short-hand 'ASC' or 'asc'.
		sortOrder = /asc/i.test(sortOrder) ? 'ascending' : 'descending';

		return { sortOn, sortOrder };
	}

	//return void;
}
