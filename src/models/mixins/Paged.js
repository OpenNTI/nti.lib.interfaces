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
	loadPage (page = 1) {
		delete this.next;
		delete this.prev;
		this.options.batchStart = Math.max(0, (page - 1) * this.getPageSize());
		this.nextBatch();
	},


	reloadPage () {
		this.loadPage(this.getCurrentPage());
	},


	getCurrentPage () {
		const {batchStart = 0} = this.options;
		return (batchStart / this.getPageSize()) + 1;
	},


	getPageCount () {
		//expects this.getTotal() to be implemented
		return Math.ceil(this.getTotal() / this.getPageSize()) || 1;
	},


	setPageSize (size) {
		this.options.batchSize = isPositiveFiniteNumber(size) ? size : 50;
		this.loadPage(1);
	},


	getPageSize () { return this.options.batchSize || 50; },


	setSearch (query) {
		this.options.search = query;
		if (typeof query !== 'string' || query === '' || /^\s+$/.test(query)) {
			delete this.options.search;
		}

		this.loadPage(1);
	},


	getSearch () { return this.options.search; }
};
