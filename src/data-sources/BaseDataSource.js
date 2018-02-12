/** @module BaseDataSource */
const BASE = Symbol('Base');

import {Service, Parent} from '../constants';


export default class BaseDataSource {
	constructor (service, parent) {
		this[Service] = service;
		this[Parent] = parent;
	}


	get service () { return this[Service]; }
	get parent () { return this[Parent]; }


	/**
	 * A indicator that it is a DataSource
	 * @readOnly
	 * @type {Boolean}
	 */
	isDataSource = true

	/**
	 * A indicator of what type of DataSource
	 * @readOnly
	 * @type {String}
	 */
	dataSourceType = BASE

	/**
	 * Define custom DataSource instance to handle given params
	 *
	 * @example
	 *  handlers = {
	 *  	paramName: {
	 *  		paramValue: DataSourceInstance
	 *  	},
	 *  	paramNameTwo: DataSourceInstance
	 *  }
	 *
	 * @type {Object}
	 */
	handlers = {}

	/**
	 * If there is a handler defined for the given params, create it with the same arguments this dataSource was constructed with
	 *
	 * @param  {Object} params         the params to get the handler for
	 * @return {BaseDataSource}        the data source to load for the params
	 */
	getHandlerFor (params) {
		const {handlers} = this;

		const isDataSource = handler => handler.isDataSource && handler.dataSourceType === this.dataSourceType;

		for (let key of Object.keys(params || {})) {
			const handler = handlers[key];
			const value = params[key];

			if (handler && isDataSource(handler)) {
				return handler;
			}

			if (handler && handler[value] && isDataSource(handler[value])) {
				return handler[value];
			}
		}

		return null;
	}


	/**
	 * Load the datasource for the given params
	 *
	 * @async
	 * @param  {Object} params the params to load the data source with
	 * @return {Promise}       fulfills/rejects with the load of the datasource
	 */
	async load (params) {
		const handler = this.getHandlerFor(params);

		const resp = await (handler ? handler.load(params) : this.request(params));

		return resp.waitForPending ? resp.waitForPending() : resp;
	}


	/**
	 * Request the data from the server. Must be overriden in the subclass.
	 *
	 * @abstract
	 * @param  {Object} params the params to request with
	 * @return {Batch}         a batch (or batch like) object
	 */
	request (params) {
		throw new Error('request must be implemented by the subclass');
	}
}

