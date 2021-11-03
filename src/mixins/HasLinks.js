import { url } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import Registry from '../models/Registry.js';
import getLinkImpl from '../utils/get-link.js';
import maybeWait from '../utils/maybe-wait.js';
import { Parser, Service, NO_LINK } from '../constants.js';
import { createUploadTask } from '../tasks/index.js';

const logger = Logger.get('mixins:HasLinks');

/** @typedef {import('./HasLinksTypes').ParseMode} ParseMode  */
/** @typedef {import('./HasLinksTypes').HttpMethod} HttpMethod  */
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
 * @template {import('../types').Constructor} T
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
				getLinkImpl(this, name) ||
				(name === 'self' && this.href) ||
				null;

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
		 * @returns {Promise<import('./HasLinksTypes').ParseType<T>>}
		 */
		async fetchLink(relOrInit) {
			const {
				data,
				params,
				method = 'get',
				mode = 'parse',
				rel,
				throwMissing = true,
			} = typeof relOrInit === 'string'
				? {
						rel: relOrInit,
				  }
				: relOrInit;

			const link = this.getLink(rel, params);
			if (!link) {
				if (!throwMissing) {
					return null;
				}
				throw new Error(NO_LINK);
			}

			let result = /^mock/i.test(link)
				? Promise.resolve(
						getLinkImpl(this, rel, true).result ||
							Promise.reject('Bad Mock Data')
				  )
				: this[Service][method?.toLowerCase()](link, data);

			if (mode && mode !== 'raw') {
				result = parseResult(this, result, mode);
			}

			return result;
		}

		uploadToLink(rel, method, data, params, parseResponse) {
			const link = this.getLink(rel, params);
			const parser = parseResponse
				? r =>
						parseResult(
							this,
							Promise.resolve(JSON.parse(r)),
							'parse'
						)
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
async function parseResult(scope, requestPromise, mode) {
	let data = await requestPromise;

	const isLibraryBatch = x =>
		!x.MimeType && x?.title === 'Library' && Array.isArray(x?.titles);

	const ItemsKey = isLibraryBatch(data) ? 'titles' : 'Items';

	if (mode !== 'parse') {
		const WrapperMime = Registry.lookup(mode)
			? mode
			: isLibraryBatch(data)
			? 'internal-batch-wrapper-library'
			: 'internal-batch-wrapper';

		data = {
			...(!data?.[ItemsKey] ? { [ItemsKey]: [data] } : data),
			// do not use the MimeType in `x` at this point, because we've set it by the `mode`.
			MimeType: WrapperMime,
		};
	}

	const extract = data?.[ItemsKey] && !data.MimeType;
	if (mode === 'parse' && extract && data.Links) {
		logger.debug(
			'Unboxing array collection. (Collection wrapper has Links and will not be accessible)'
		);
	}

	data = extract ? data?.[ItemsKey] : data;
	data = scope[Parser](data);
	await maybeWait(data);
	return data;
}
