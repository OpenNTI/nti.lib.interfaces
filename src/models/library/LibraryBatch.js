import Batch from '../../data-sources/data-types/Batch.js';
import Registry from '../Registry.js';

export class LibraryBatch extends Batch {
	static MimeType = 'internal-batch-wrapper-library';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'titles': { type: 'model[]' },
	}

	get Items() {
		return this.titles || [];
	}
}

Registry.register(LibraryBatch);
