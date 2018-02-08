/** @module BaseDataSource */
const BASE = Symbol('Base');

export default class BaseDataSource {
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

		for (let key of Object.keys(params)) {
			const handler = handlers[key];
			const value = params[key];

			if (handler && isDataSource(handler)) {
				return handler;
			}

			if (handler && handler[value] && isDataSource(handler)) {
				return handler;
			}
		}

		return null;
	}
}

