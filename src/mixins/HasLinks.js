import { URL } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import getLinkImpl from '../utils/get-link.js';
import maybeWait from '../utils/maybe-wait.js';
import { Parser, Service, NO_LINK } from '../constants.js';
import { createUploadTask } from '../tasks/index.js';

const logger = Logger.get('mixins:HasLinks');

/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @mixin
 */
export const mixin = Base =>
	class extends Base {
		getLink(rel, params) {
			const [name, ...segments] = rel.split('/');
			let link =
				getLinkImpl(this, name) || (name === 'self' && this.href);

			if (link && segments.length > 0) {
				link = URL.join(link, ...segments);
			}

			if (link && params) {
				link = URL.appendQueryParams(link, params);
			}

			return link;
		}

		getLinkProperty(rel, prop) {
			const link = getLinkImpl(this, rel, true);
			return link && link[prop];
		}

		hasLink(rel) {
			return !!this.getLink(rel);
		}

		fetchLinkParsed(rel, params) {
			return this.fetchLink(rel, params, true);
		}

		fetchLink(rel, params, parseResponse) {
			return this.requestLink(rel, 'get', void 0, params, parseResponse);
		}

		deleteLink(rel) {
			return this.requestLink(rel, 'delete');
		}

		postToLink(rel, data, parseResponse) {
			return this.requestLink(rel, 'post', data, void 0, parseResponse);
		}

		putToLink(rel, data, parseResponse) {
			return this.requestLink(rel, 'put', data, void 0, parseResponse);
		}

		async requestLink(rel, method, data, params, parseResponse) {
			const link = this.getLink(rel, params);
			if (!link) {
				throw new Error(NO_LINK);
			}

			let result = /^mock/i.test(link)
				? Promise.resolve(
						getLinkImpl(this, rel, true).result ||
							Promise.reject('Bad Mock Data')
				  )
				: this[Service][method](link, data);

			if (parseResponse) {
				result = parseResult(this, result);
			}

			return result;
		}

		uploadToLink(rel, method, data, params, parseResponse) {
			const link = this.getLink(rel, params);
			const parser = parseResponse
				? r => parseResult(this, Promise.resolve(JSON.parse(r)))
				: null;

			return createUploadTask(link, data, method, parser);
		}

		putUploadToLink(rel, data, parseResponse) {
			return this.uploadToLink(rel, 'PUT', data, void 0, parseResponse);
		}

		postUploadToLink(rel, data, parseResponse) {
			return this.uploadToLink(rel, 'POST', data, void 0, parseResponse);
		}
	};

/*** Utility private functions ***/

function parseResult(scope, requestPromise) {
	function selectItems(x) {
		const extract = x && x.Items && !x.MimeType;

		if (extract && x.Links) {
			logger.debug(
				'Unboxing array collection. (Collection wrapper has Links and will not be accessible)'
			);
		}

		return extract ? x.Items : x;
	}

	return requestPromise
		.then(selectItems)
		.then(x => scope[Parser](x))
		.then(o =>
			Array.isArray(o) ? Promise.all(o.map(maybeWait)) : maybeWait(o)
		);
}
