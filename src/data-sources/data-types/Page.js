import Batch from './Batch.js';

export default class Page extends Batch {
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
