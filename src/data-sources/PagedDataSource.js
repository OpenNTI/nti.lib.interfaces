import BaseDataSource from './BaseDataSource';

const PAGES = Symbol('Pages');

export default class PagedDataSource extends BaseDataSource {
	static dataSourceType = PAGES

	/**
	 * Throw an error if load is called on a PagedDataSource
	 *
	 * @return {Void} no return
	 */
	load () { throw new Error('Cannot call load on a PagedDataSource'); }

	/**
	 * Load the page for the given ID and params
	 *
	 * @param  {(String|Number)} pageID the ID for the page to load
	 * @param  {Object}          params the params to load the page with
	 * @return {Promise}        		fulfills/rejects with loading the page
	 */
	async loadPage (pageID, params) {
		const handler = this.getHandler(params);

		const resp =  await (handler && handler.loadPage ? handler.loadPage(pageID, params) : this.requestPage(pageID, params));

		return resp.waitForPending ? resp.waitForPending() : resp;
	}

	/**
	 * Load  the page around a given id
	 *
	 * @param  {String} around the id to load around
	 * @param  {Object} params params to load aroudn with
	 * @return {Promise}       fullfills/rejects with load around
	 */
	async loadAround (around, params) {
		const handler = this.getHandler(params);

		const resp = await (handler && handler.loadAround ? handler.loadAround(around, params) : this.requestAround(around, params));

		return resp.waitForPending ? resp.waitForPending() : resp;
	}

	/**
	 * Request the page from the server. Must be overriden in sub-classes.
	 *
	 * @abstract
	 * @param  {(String|Number)} pageID the ID for the page to request
	 * @param  {Object}          params the params to request the page with
	 * @return {Promise}        		fulfills/rejects with the request for the page
	 */
	requestPage (pageID, params) {
		throw new Error('requestPage must be implemented by the subclass');
	}

	requestAround (around, params) {
		throw new Error('requestAround must be implemented by the sub class');
	}
}
