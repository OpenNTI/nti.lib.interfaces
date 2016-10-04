import Part from '../Part';
import {FileType} from 'nti-commons';

export default class File extends Part {

	constructor (service, parent, data) {
		super(service, parent, data);
		this.fileSetDescriptor = new FileType.FileSetDescriptor(
			this.allowed_extensions || ['*'],
			this.allowed_mime_types || ['*/*']
		);
	}

	isFileAcceptable (file) {
		const r = this.reasons = [];

		if (!this.fileSetDescriptor.matches(file)) {
			r.push('The file type is not allowed.');
		}

		if (!this.checkFileSize(file.size)) {
			r.push('The file is too large.');
		}

		return r.length === 0;
	}


	checkFileSize (size) {
		let max = this.max_file_size || Infinity;
		return size < max && size > 0;
	}

}
