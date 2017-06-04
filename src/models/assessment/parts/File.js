import {FileType} from 'nti-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

@model
export default class File extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.filepart'

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
