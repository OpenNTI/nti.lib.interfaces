import path from 'path';

import { decorate, FileType } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry.js';
import Part from '../Part.js';

class File extends Part {
	static MimeType = COMMON_PREFIX + 'assessment.filepart';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'allowed_extensions': { type: 'string[]' },
		'allowed_mime_types': { type: 'string[]' },
		'max_file_size':      { type: 'number'   },
	}

	fileSetDescriptor = new FileType.FileSetDescriptor(
		this.allowed_extensions || ['*'],
		this.allowed_mime_types || ['*/*']
	);

	validateFile(file) {
		const r = (this.reasons = []);

		if (!this.fileSetDescriptor.matches(file)) {
			const extension = path.extname((file || {}).name || '');
			const parens = s => (s ? `(${s})` : s);
			const typeString = parens(
				[extension, (file || {}).type].filter(Boolean).join(', ')
			);
			r.push(`The file type ${typeString} is not allowed.`);
		}

		if (!this.checkFileSize(file.size)) {
			r.push('The file is too large.');
		}

		return r;
	}

	isFileAcceptable(file) {
		return this.validateFile(file).length === 0;
	}

	checkFileSize(size) {
		let max = this.max_file_size || Infinity;
		return size < max && size > 0;
	}
}

export default decorate(File, [model]);
