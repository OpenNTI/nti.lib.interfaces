import Base from '../Base';

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
		//	mkdirs   - make n new child directories
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


	/**
	 * @return {string} The url-safe slugified version of the filename.
	 */
	getEntityName () {
		return this.name;
	}


	getFileName () {
		return this.filename || this.title || this.name || '?unknown?';
	}


	getPath () {
		return this.path || '/';
	}
}
