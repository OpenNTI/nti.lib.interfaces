import Base from './Base';

const PAGES = Symbol('Pages');

export default class PagedDataSource extends Base {
	static dataSourceType = PAGES

	/**
	 * Load the page for the given ID and params
	 *
	 * @param  {(String|Number)} pageID the ID for the page to load
	 * @param  {Object}          params the params to load the page with
	 * @return {Promise}        		fulfills/rejects with loading the page
	 */
	loadPage (pageID, params) {
		const handler = this.getHandler(params);

		return handler && handler.loadPage ? handler.loadPage(pageID, params) : this.requestPage(pageID, params);
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
		throw new Error('requestPage must be implemented in the subclass');
	}
}
