import { Service, Parent } from '../constants.js';

/** @typedef {import('./data-types/Batch.js').default} Batch */

const BASE = Symbol('Base');
const KNOWN_PARAMS = Symbol('Known Params');
const CONFIG = Symbol('Config');

export default class BaseDataSource {
	constructor(service, parent, knownParams, config) {
		this[Service] = service;
		this[Parent] = parent;

		this[KNOWN_PARAMS] = knownParams;
		this[CONFIG] = config;
	}

	get service() {
		return this[Service];
	}
	get parent() {
		return this[Parent];
	}
	get config() {
		return this[CONFIG];
	}
	get knownParams() {
		return this[KNOWN_PARAMS];
	}

	getKnownParam(param) {
		return (this.knownParams || {})[param];
	}

	/**
	 * A indicator that it is a DataSource
	 *
	 * @readonly
	 * @type {boolean}
	 */
	isDataSource = true;

	/**
	 * A indicator of what type of DataSource
	 *
	 * @readonly
	 * @type {string}
	 */
	dataSourceType = BASE;

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
	 * @type {Object}
	 */
	handlers = {};

	/**
	 * If there is a handler defined for the given params, create it with the same arguments this dataSource was constructed with
	 *
	 * @param  {Object} params         the params to get the handler for
	 * @returns {BaseDataSource}        the data source to load for the params
	 */
	getHandler(params) {
		const { handlers } = this;

		const isDataSource = handler =>
			handler.isDataSource &&
			handler.dataSourceType === this.dataSourceType;

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
	 * @returns {Promise}       fulfills/rejects with the load of the datasource
	 */
	async load(params) {
		const handler = this.getHandler(params);

		const resp = await (handler
			? handler.load(params)
			: this.request(params));

		return resp.waitForPending ? resp.waitForPending() : resp;
	}

	/**
	 * Request the data from the server. Must be overriden in the subclass.
	 *
	 * @abstract
	 * @param  {Object} params the params to request with
	 * @returns {Batch}         a batch (or batch like) object
	 */
	request(params) {
		throw new Error('request must be implemented by the subclass');
	}
}
