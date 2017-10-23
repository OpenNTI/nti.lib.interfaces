import {URL} from 'nti-commons';
import Logger from 'nti-util-logger';

import getLinkImpl from '../utils/getlink';
import {Parser, Service, NO_LINK} from '../constants';

const logger = Logger.get('mixins:HasLinks');

export default {


	getLink (rel, params) {
		let link = getLinkImpl(this, rel) || (rel === 'self' && this.href);

		if (link && params) {
			link = URL.appendQueryParams(link, params);
		}

		return link;
	},


	hasLink (rel) {
		return !!this.getLink(rel);
	},


	fetchLinkParsed (rel, params) {
		return this.fetchLink(rel, params, true);
	},


	fetchLink (rel, params, parseResponse) {
		return this.requestLink(rel, 'get', void 0, params, parseResponse);
	},


	postToLink (rel, data, parseResponse) {
		return this.requestLink(rel, 'post', data, void 0, parseResponse);
	},


	putToLink (rel, data, parseResponse) {
		return this.requestLink(rel, 'put',data, void 0, parseResponse);
	},


	requestLink (rel, method, data, params, parseResponse) {

		const link = this.getLink(rel, params);
		if (!link) {
			return Promise.reject(NO_LINK);
		}

		let result = /^mock/i.test(link)
			? Promise.resolve(getLinkImpl(this, rel, true).result || Promise.reject('Bad Mock Data'))
			: this[Service][method](link, data);

		if (parseResponse) {
			result = parseResult(this, result);
		}

		return result;
	}
};


/*** Utility private functions ***/


function parseResult (scope, requestPromise) {
	const maybeWait = x => (x && x.waitForPending) ? x.waitForPending() : x;

	function selectItems (x) {
		const extract = x && x.Items && !x.MimeType;

		if (extract && x.Links) {
			logger.warn('Dropping Collection Links');
		}

		return extract ? x.Items : x;
	}

	return requestPromise
		.then(selectItems)
		.then(x=> scope[Parser](x))
		.then(o =>
			Array.isArray(o)
				? Promise.all( o.map(maybeWait) )
				: maybeWait(o)
		);
}