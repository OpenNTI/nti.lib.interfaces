import {FileType} from 'nti-commons';

import {model, COMMON_PREFIX} from '../../Registry';
import Part from '../Part';

export default
@model
class File extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.filepart'

	static Fields = {
		...Part.Fields,
		'allowed_extensions': { type: 'string[]' },
		'allowed_mime_types': { type: 'string[]' },
		'max_file_size':      { type: 'number'   },
	}

	fileSetDescriptor = new FileType.FileSetDescriptor(
		this.allowed_extensions || ['*'],
		this.allowed_mime_types || ['*/*']
	)


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
