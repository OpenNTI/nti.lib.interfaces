import { url } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import Registry from '../models/Registry.js';
import getLinkImpl from '../utils/get-link.js';
import maybeWait from '../utils/maybe-wait.js';
import { Parser, Service, NO_LINK } from '../constants.js';
import { createUploadTask } from '../tasks/index.js';

const logger = Logger.get('mixins:HasLinks');

/** @typedef {import('./HasLinks').ParseMode} ParseMode  */
/** @typedef {import('./HasLinks').HttpMethod} HttpMethod  */
/**
 * @template {ParseMode} T
 * @typedef {object} FetchInit
 * @property {string} rel
 * @property {T} [mode='parse']
 * @property {HttpMethod} [method="GET"]
 * @property {object=} params
 * @property {object=} data
 */

/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @mixin
 */
export const mixin = Base =>
	class extends Base {
		/**
		 * Internal to model usage.
		 *
		 * @private
		 * @param {string} rel The name of the link. Optionally followed by a path to append ex: `join("list", search)` => `list/<searchText>`
		 * @param {object} params Appends query params to the link.
		 * @returns {string?}
		 */
		getLink(rel, params) {
			const [name, ...segments] = rel?.split('/') || [];
			let link =
				getLinkImpl(this, name) || (name === 'self' && this.href);

			if (link && segments.length > 0) {
				link = url.join(link, ...segments);
			}

			if (link && params) {
				link = url.appendQueryParams(link, params);
			}

			return link;
		}

		getLinkProperty(rel, prop) {
			return getLinkImpl(this, rel, true)?.[prop];
		}

		hasLink(rel) {
			return !!this.getLink(rel);
		}

		deleteLink(rel, params) {
			return this.fetchLink({ rel, method: 'delete', params });
		}

		/**
		 * @param {string} rel
		 * @param {object} data
		 * @param {boolean|'batch'} parseResponse
		 * @deprecated
		 * @returns {object}
		 */
		postToLink(rel, data, parseResponse) {
			return this.fetchLink({
				rel,
				method: 'post',
				data,
				mode:
					parseResponse === 'batch'
						? 'batch'
						: parseResponse
						? 'parse'
						: 'raw',
			});
		}

		/**
		 * @param {string} rel
		 * @param {object} data
		 * @param {boolean|'batch'} parseResponse
		 * @deprecated
		 * @returns {object}
		 */
		putToLink(rel, data, parseResponse) {
			return this.fetchLink({
				rel,
				method: 'put',
				data,
				mode:
					parseResponse === 'batch'
						? 'batch'
						: parseResponse
						? 'parse'
						: 'raw',
			});
		}

		/**
		 * Fetch a named link from the server on this model instance.
		 *
		 *     // uncomment when  https://github.com/microsoft/TypeScript/pull/45483 lands.
		 *     //@template {ParseMode} [T='parse']
		 *
		 * @template {ParseMode} T
		 * @param {string|FetchInit<T>} relOrInit
		 * @returns {Promise<import('./HasLinks').ParseType<T>>}
		 */
		async fetchLink(relOrInit) {
			const {
				data,
				params,
				method = 'get',
				mode = 'parse',
				rel,
			} = typeof relOrInit === 'string'
				? {
						rel: relOrInit,
				  }
				: relOrInit;

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

			if (mode && mode !== 'raw') {
				result = parseResult(this, result, mode);
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

/**
 *
 * @param {Base} scope
 * @param {Promise<Object>} requestPromise
 * @param {'parse'|'batch'|string} mode - the string 'parse', 'batch' (or a mimetype in the registry to use as the wrapper.)
 * @returns {Base|Base[]} An instance of a parsed model or an array or models
 */
function parseResult(scope, requestPromise, mode) {
	function selectItems(x) {
		const extract = x && x.Items && !x.MimeType;

		const WrapperMime = Registry.lookup(mode)
			? mode
			: 'internal-batch-wrapper';

		if (mode === 'parse' && extract && x.Links) {
			logger.debug(
				'Unboxing array collection. (Collection wrapper has Links and will not be accessible)'
			);
		}

		return mode !== 'parse'
			? !x.Items
				? { MimeType: WrapperMime, Items: [x] }
				: ((x.MimeType = x.MimeType || WrapperMime), x)
			: extract
			? x.Items
			: x;
	}

	return requestPromise
		.then(selectItems)
		.then(x => scope[Parser](x))
		.then(o =>
			Array.isArray(o) ? Promise.all(o.map(maybeWait)) : maybeWait(o)
		);
}
