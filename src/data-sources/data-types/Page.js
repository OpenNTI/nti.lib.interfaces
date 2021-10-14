import Registry from '../../models/Registry.js';

import Batch from './Batch.js';

export default class Page extends Batch {
	static MimeType = 'internal-batch-page-wrapper';

	get TotalPageCount() {
		return this.pageCount;
	}

	getItemCount() {
		return this.count;
	}

	getTotalItemCount() {
		return this.totalInContext;
	}

	getUnfilteredItemCount() {
		return this.total;
	}

	loadNextPage = this.next;
}

Registry.register(Page);
