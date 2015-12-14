const isPositiveFiniteNumber = n => typeof n === 'number' && isFinite(n) && n > 0;

export default {

	constructor () {
		this.continuous = false;
	},

	/**
	 * loadPage
	 *
	 * @param {number} page Page number. (1...n)
	 * @return {void}
	 */
	loadPage (page) {
		delete this.next;
		delete this.prev;
		this.options.batchStart = (page - 1) * this.getPageSize();
		this.nextBatch();
	},


	getCurrentPage () {
		const {batchStart, batchSize} = this.options;
		return (batchStart / batchSize) + 1;
	},


	setPageSize (size) {
		this.options.batchSize = isPositiveFiniteNumber(size) ? size : 50;
		this.loadPage(0);
	},


	getPageSize () { return this.options.batchSize || 50; },


	search (query) {
		this.options.search = query;
		if (typeof query !== 'string' || query === '' || /\s/) {
			delete this.options.search;
		}

		this.loadPage(0);
	}
};
