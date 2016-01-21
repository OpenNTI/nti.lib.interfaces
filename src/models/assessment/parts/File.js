import Part from '../Part';

import isEmpty from 'isempty';
//import escapeStringForRegExp from '../../../utils/...';

function getRegExp (pattern, regExpFormat) {
	//TODO: get the RegExp#escape impl form WebApp... (escape is not part of the spec)
	let o = RegExp.escape(pattern).replace(/\\\*/g, '[^/]+');
	return new RegExp((regExpFormat || '^{0}$').replace('{0}', o));
}

export default class File extends Part {

	constructor (service, parent, data) {
		super(service, parent, data);
	}

	isFileAcceptable (file) {
		let name = this.checkFileExtention(file.name),
			type = this.checkMimeType(file.type),
			size = this.checkFileSize(file.size),
			r = this.reasons = [];

		if (!name) {
			r.push('Name does not have an acceptible extention: ' + this.allowed_extentions.join(', '));
		}

		if (!type) {
			r.push('The file is of a type we do not allow.');
		}

		if (!size) {
			r.push('The file is too large.');
		}

		return name && type && size;
	}


	checkMimeType (mime) {
		let allowed = this.allowed_mime_types || ['*/*'];

		if (isEmpty(mime)) {
			mime = '-/-';
		}

		return allowed.some(o =>getRegExp(o).test(mime));
	}


	checkFileExtention (name) {
		let allowed = this.allowed_extentions || ['*.*'];
		return allowed.some(o =>getRegExp(o, '{0}$').test(name));
	}


	checkFileSize (size) {
		let max = this.max_file_size || Infinity;
		return size < max && size > 0;
	}

}
