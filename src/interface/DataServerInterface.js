/*globals BUILD_PACKAGE_NAME, BUILD_PACKAGE_VERSION*/
import EventEmitter from 'events';

import Logger from '@nti/util-logger';
import { FileType, URL } from '@nti/lib-commons';

import DataCache from '../utils/datacache';
import parseBody from '../utils/attempt-json-parse';
import getContentType from '../utils/get-content-type-header';
import getLink, { getLinks } from '../utils/getlink';
import encodeFormData from '../utils/encode-form-data';
import OnlineStatus from '../utils/OnlineStatus.js';
import toObject from '../utils/to-object';
import { getTimezone } from '../utils/timezone';
import { attach as attachPendingQueue } from '../mixins/Pendability';
import Service from '../stores/Service';
import {
	REQUEST_CONFLICT_EVENT,
	REQUEST_ERROR_EVENT,
	TOS_NOT_ACCEPTED,
} from '../constants';

const CONTINUE = 'logon.continue';
const CONTINUE_ANONYMOUSLY = 'logon.continue-anonymously';
const HANDSHAKE = 'logon.handshake';

const SERVICE_DATA_CACHE_KEY = 'service-doc';
const SERVICE_INST_CACHE_KEY = 'service-doc-instance';

const logger = Logger.get('DataServerInterface');

const { btoa } = global;

const Request = Symbol('Request Adaptor');
const onlineStatus = Symbol('Online Status');

const BLACKLIST_FORWARDED_HEADERS = [
	'content-type',
	'etag',
	'if-modified-since',
	'referer',
	'x-forwarded-protocol',
];

export default class DataServerInterface extends EventEmitter {
	constructor(config) {
		super();
		this.nextRequestId = 1;
		this.config = config;

		if (!config || !config.server) {
			throw new Error('No configuration');
		}

		if (!process.browser) {
			return;
		}

		try {
			const headers = (this.headers = {});

			//App Identifier headers
			if (typeof BUILD_PACKAGE_NAME !== 'undefined') {
				headers['X-NTI-Client-App'] = BUILD_PACKAGE_NAME;
			}

			if (typeof BUILD_PACKAGE_VERSION !== 'undefined') {
				headers['X-NTI-Client-Version'] = BUILD_PACKAGE_VERSION;
			}

			const { offset, name } = getTimezone();
			headers['X-NTI-Client-TZOffset'] = offset;
			headers['X-NTI-Client-Timezone'] = name;
		} catch (e) {
			logger.warn(
				'Could not set all custom headers: %s',
				e.stack || e.message || e
			);
		}
	}

	get OnlineStatus() {
		if (!this[onlineStatus]) {
			this[onlineStatus] = new OnlineStatus();
		}

		return this[onlineStatus];
	}

	dispatch(...args) {
		if (this.config.dispatch) {
			this.config.dispatch.call(null, args);
		}
	}

	/**
	 * Add/Set header values to be sent with all requests.
	 *
	 * @method setDefaultHeaders
	 * @param  {Object}          headers A simple object with Keys/Value pairs for header/value pairs.
	 * @returns {void}
	 */
	setDefaultHeaders(headers) {
		this.headers = {
			...(this.headers || {}),
			...headers,
		};
	}

	/**
	 * Makes a request to the dataserver.
	 *   It should be noted that this is intented to facilitate and abstract the act
	 *   of making a request to the dataserver so it is transparent between nodejs and a
	 *   web browser. Do not use this directly. Only use the interface methods NOT
	 *   prefixed with underscores.
	 *
	 * @param {object/string} [options] - Request options or URL.
	 * @param {string} [options.url] - The dataserver resource we wish to make the request for, or an absolute url.
	 * @param {string} [options.method] - defaults to GET, and POST if `form` is set.
	 * @param {Object} [options.data] - A dictionary of form values to send with the request.
	 * @param {boolean} [options.blob] - return a blob
	 * @param {Object} [options.headers] - HTTP headers to add to the request.
	 * @param {Object} [context] - An active request context to the node's "express" http server.
	 * @returns {Promise} The promise of data or rejection ;)
	 * @private
	 */
	[Request](options, context) {
		//Make sure options is the normalize shape.
		if (typeof options === 'string') {
			options = { url: options };
		}

		const controller = new AbortController();
		const abort = () => controller.abort();
		const id = this.nextRequestId++;
		const start = Date.now();
		const url = URL.resolve(this.config.server, options.url || '');

		delete options.url; //make sure we only give fetch() one url...

		const { data, blob } = options;
		const { accept } = options.headers || {};
		const mime = accept && new FileType.MimeComparator(accept);

		const init = {
			credentials: 'same-origin',
			method: data ? 'POST' : 'GET',
			signal: controller.signal,
			...options,
		};

		//setting options.headers to explicitly null will prevent our standard headers from being applied
		if (options.headers !== null) {
			init.headers = {
				...options.headers,
				...(this.headers || {}),

				//Always override these headers
				accept: mime || (blob ? void 0 : 'application/json'),
				'x-requested-with': 'XMLHttpRequest',
			};
		} else {
			delete init.headers;
		}

		if (context) {
			init.headers = {
				//FIXME: This really just needs to copy a few known headers (such as host/origin/cookie/etc)
				// instead of blacklisting below.
				...(context.headers || {}),
				...init.headers,
				'accept-encoding': '',
			};

			for (const blocked of BLACKLIST_FORWARDED_HEADERS) {
				delete init.headers[blocked];
			}
		} else if (!process.browser) {
			throw new Error('Calling request w/o context!');
		}

		if (data != null) {
			//fetch() api only allows the init.body to be an instance of these things:
			//ArrayBuffer, ArrayBufferView, Blob/File, URLSearchParams, FormData or a string
			//typeof will return === 'object' for all but strings... so with the above, we will
			//have an unset init.body unless we need to encode it...
			const useDataRaw =
				(typeof FormData !== 'undefined' && data instanceof FormData) ||
				(typeof Blob !== 'undefined' && data instanceof Blob) ||
				(typeof File !== 'undefined' && data instanceof File) ||
				(data.buffer != null && data.BYTES_PER_ELEMENT != null) || //all TypedArrays (ArrayBufferView)
				(typeof ArrayBuffer !== 'undefined' &&
					data instanceof ArrayBuffer) ||
				(typeof URLSearchParams !== 'undefined' &&
					data instanceof URLSearchParams) ||
				typeof data === 'string';

			init.body = useDataRaw ? data : JSON.stringify(data);

			if (!useDataRaw) {
				init.headers['Content-Type'] = 'application/json';
			}
		}

		const result = new Promise((fulfillRequest, rejectRequest) => {
			logger.trace('REQUEST %d (send) -> %s %s', id, init.method, url);
			// logger.trace('REQUEST %d HEADERS: %s %s:\n%o', id, init.method, url, init.headers);

			if (context) {
				if (context.dead) {
					return rejectRequest('request/connection aborted');
				}

				if (context.on) {
					context.on('aborted', abort);
					context.on('close', abort);
				}
			}

			const maybeFulfill = (...args) =>
				!controller.aborted && fulfillRequest(...args);
			const maybeReject = (...args) =>
				!controller.aborted && rejectRequest(...args);

			const networkCheck = this.__checkRequestNetwork.bind(
				this,
				id,
				url,
				init,
				data,
				start,
				context
			);

			fetch(url, init)
				// Normalize request failures
				.catch(e =>
					Promise.reject({
						Message: 'Request Failed.',
						statusCode: 0,
						error: e,
					})
				)

				// Check Network Status
				.then(networkCheck, networkCheck)

				// Check status
				.then(
					this.__checkRequestStatus.bind(
						this,
						id,
						url,
						init,
						data,
						start,
						context
					)
				)

				//Parsing response
				.then(response =>
					blob //caller wants a blob
						? Promise.reject({ skip: response.blob() })
						: //we don't use .json() because we need to fallback if it doesn't parse.
						  response
								.text()
								.then(parseBody)
								.then(body => ({ response, body }))
				)

				//Handle cookies and validate mimes. (server side stuff mostly)
				.then(({ body, response }) => {
					const headers = toObject(response.headers);
					if (headers['set-cookie'] && context) {
						context.responseHeaders = context.responseHeaders || {};
						context.responseHeaders['set-cookie'] =
							headers['set-cookie'];
					}

					//If sent an explicit Accept header the server
					//may return a 406 if the Accept value is not supported
					//or it may just return whatever it wants.  If we send
					//Accept we check the Content-Type to see if that is what
					//we get back.  If it's not, we reject.
					if (mime) {
						const contentType = getContentType(headers);
						if (!mime.is(contentType)) {
							return Promise.reject(
								'Requested with an explicit accept value of ' +
									mime +
									' but got ' +
									contentType +
									'.  Rejecting.'
							);
						}
					}

					return body;
				})

				//handle some checkStatus errors, or pass them on
				.catch(reason => reason.skip || Promise.reject(reason))

				//finally, finish
				.then(maybeFulfill, maybeReject);
		});

		result.abort = () => controller.abort();
		result.id = id;

		if (context) {
			attachPendingQueue(context).addToPending(result);
		}
		return result;
	}

	async __checkRequestNetwork(id, url, init, data, start, context, response) {
		const status = response.statusCode ?? response.status;

		//If we got a non-zero response status, there was no network error
		//so we can just continue on our merry way.
		if (status !== 0) {
			this.OnlineStatus.hadNetworkSuccess();
			return response;
		}

		//A zero response status means there was a network error
		//so we need to tell people
		//
		//TODO: there is an opportunity here to retry requests (up to a max)
		//to help smooth out transient network issues
		this.OnlineStatus.hadNetworkError();
		throw response;
	}

	async __checkRequestStatus(id, url, init, data, start, context, response) {
		logger.trace(
			'REQUEST %d (recv) <- %s %s %s %dms',
			id,
			init.method,
			url,
			response.statusText,
			Date.now() - start
		);
		if (response.ok) {
			return response;
		}

		const error = {
			Message: response.statusText,
			response,
			statusCode: response.status,
		};

		try {
			const json = await response.json();

			json.Message = json.Message || json.message;

			Object.assign(error, json);

			const isConflict = response.status === 409;

			if (isConflict) {
				error.confirm = async (config = {}) => {
					const { rel = 'confirm', data: conflictData } = config;
					const link = getLink(json, rel, true);
					const { method, href } = link;
					const newData =
						method === 'GET' ? null : conflictData || data;

					if (!href) {
						throw new Error(
							`No Link for rel "${rel}" in response challenge`
						);
					}

					return this[Request](
						{
							url: href,
							method: method || init.method,
							data: newData,
						},
						context
					);
				};

				let confirm;
				let reject;

				const waitOn = new Promise(
					(continueRequest, rejectConflict) => {
						confirm = (...args) =>
							error
								.confirm(...args)
								.then(continueRequest, rejectConflict);
						reject = () =>
							rejectConflict(
								Object.assign(error, { resolved: true })
							);
					}
				);

				// We're expecting a top-level App-Wide component to listen and handle this event.
				// Allowing for a Centralized Conflict Resolver.  If this is not handled, we will
				// continue to reject (leaving a confirm method).
				if (
					this.emit(REQUEST_CONFLICT_EVENT, {
						...json,
						confirm,
						reject,
					})
				) {
					//Reject with an object that has a key 'skip' which is our confirm Promise
					//...so we can skip the parsing and body handling below. (the confirm will
					// do that work for itself)
					return Promise.reject({ skip: waitOn });
				}
			}

			throw Object.assign(new Error(response.statusText), error);
		} catch (reason) {
			//Let the world know there was a request failure...and let them potentially display/act on it
			if (!reason.skip) {
				this.emit(REQUEST_ERROR_EVENT, error);
			}

			throw reason;
		}
	}

	get(url, context) {
		return this[Request](url, context);
	}

	post(url, data, context) {
		return this[Request](
			{
				method: 'POST',
				url,
				data,
			},
			context
		);
	}

	put(url, data, context) {
		return this[Request](
			{
				method: 'PUT',
				url,
				data,
			},
			context
		);
	}

	delete(url, context) {
		return this[Request](
			{
				method: 'DELETE',
				url,
			},
			context
		);
	}

	getServiceDocument(context, options) {
		const { refreshing } = options || {};
		const cache = DataCache.getForContext(context);
		const cached = cache.get(SERVICE_INST_CACHE_KEY);

		const set = x => cache.setVolatile(SERVICE_INST_CACHE_KEY, x);

		//Do we have an instance? (and we're not refreshing...)
		if (cached && !refreshing) {
			return Promise.resolve(cached);
		}

		const data = cache.get(SERVICE_DATA_CACHE_KEY);
		const promise = (data && !refreshing //Do we have the data to build an instance? (are we're not freshing...)
			? // Yes...
			  Promise.resolve(new Service(data, this, context))
			: //No... okay... get the data, but first we have to perform a ping/handshake...
			  this.ping(void 0, context)

					// now we can get the url of the service doc...
					.then(
						result =>
							result.getLink(CONTINUE) ||
							result.getLink(CONTINUE_ANONYMOUSLY) ||
							Promise.reject(
								Object.assign(
									//captures the initial call site.
									new Error(
										'No continue link. Cannot fetch service document.'
									),
									{
										NoContinueLink: true,
									}
								)
							)
					)

					// With the url, we can finally load...
					.then(serviceUrl => this.get(serviceUrl, context))

					// Now that we have the data, save it into cache...
					.then(
						json => cache.set(SERVICE_DATA_CACHE_KEY, json) && json
					)

					//Setup our Service instance...
					.then(json =>
						!cached
							? //If we're not freshing, build a new Service...
							  new Service(json, this, context)
							: // Otherwise, update the existing one...
							  Promise.resolve(cached) // "cached" may be a promise, so resolve/unwrap it first.
									// Now we can apply the new data.
									.then(doc => doc.assignData(json))
					)
		)
			// Wait for all the tasks that got spun up when we parsed the data...
			.then(doc => doc.waitForPending()); // waitForPending resolves with itself ("doc" in this case)

		//once we have an instance, stuff it in the cache so we don't keep building it.
		promise.then(set, () => {}); //This forked promise needs to handle the rejection (the noop).

		//until the promise resolves, cache the promise itself. (Promise.resolve()
		//when given a promise, will resolve when the passed promise resolves)
		set(promise);

		//Return a promise that will fulfill with the instance...
		return promise;
	}

	refreshServiceDocument(context) {
		// load the service fresh, and apply data onto the existing service doc.
		return this.getServiceDocument(context, { refreshing: true });
	}

	logInPassword(url, username, password) {
		if (typeof username === 'object') {
			password = username.password || void 0;
			username = username.username || void 0;
		}

		const auth = password
			? 'Basic ' + btoa(username + ':' + password)
			: undefined;
		const options = {
			url: url,
			method: 'GET',
			xhrFields: { withCredentials: true },
			headers: {
				Authorization: auth,
			},
		};
		return this[Request](options);
	}

	logInOAuth(url, successUrl, failureUrl) {
		const href = this.computeOAuthUrl(url, successUrl, failureUrl);
		global.location.replace(href);
	}

	computeOAuthUrl(url, successUrl, failureUrl) {
		//OAuth logins only work client side, so this method will only work in a browser, and will fail on node.
		return URL.appendQueryParams(url, {
			success: successUrl,
			failure: failureUrl,
		});
	}

	async ping(username, context) {
		username = username || context?.cookies?.username;

		const pong = context?.pong || (await this.get('logon.ping', context));

		if (context) {
			context.pong = pong;
		}

		if (!getLink(pong, HANDSHAKE)) {
			return Promise.reject('No handshake present');
		}

		if (!username) {
			//Not logged in... we need the urls
			if (!getLink(pong, CONTINUE)) {
				return {
					pong,
					links: getLinks(pong).map(x => x.rel),
					getLink: (...rel) => getLink(pong, ...rel),
					hasLink: rel => !!getLink(pong, rel),
				};
			}

			//There is a continue link, but we need our username to handshake...
			username = pong.AuthenticatedUsername;
		}

		return this.handshake(pong, username, context);
	}

	async handshake(pong, username, context) {
		const data = !username ? {} : { username };
		const handshake = await this.post(
			getLink(pong, HANDSHAKE),
			encodeFormData(data),
			context
		);
		const result = {
			pong,
			handshake,
			links: [
				...new Set([
					...getLinks(pong).map(x => x.rel),
					...getLinks(handshake).map(x => x.rel),
				]),
			],
			getLink: (...rel) =>
				getLink(handshake, ...rel) || getLink(pong, ...rel),
			hasLink: rel => !!(getLink(handshake, rel) || getLink(pong, rel)),
		};

		if (!result.getLink(CONTINUE)) {
			result.reason = 'Not authenticated, no continue after handshake.';
			return Promise.reject(result);
		}
		return result;
	}

	async deleteTOS(context) {
		const pong = await this.ping(void 0, context);
		const link = pong.getLink(TOS_NOT_ACCEPTED);

		if (!link) {
			//wut? - This should throw
			return 'initial_tos_page link not present.';
		}

		return this.delete(link, context);
	}

	async recoverUsername(email, context) {
		const data = encodeFormData({
			email,
		});

		return this._pongPost('logon.forgot.username', data, context);
	}

	async recoverPassword(email, username, returnURL, context) {
		const data = encodeFormData({
			email,
			username,
			success: returnURL,
		});

		return this._pongPost('logon.forgot.passcode', data, context);
	}

	async resetPassword(username, password, id, context) {
		const data = encodeFormData({
			id,
			username,
			password,
		});

		return this._pongPost('logon.reset.passcode', data, context);
	}

	async preflightAccountCreate(fields, context) {
		return this._pongPost('account.preflight.create', fields, context);
	}

	async createAccount(fields, context) {
		return this._pongPost('account.create', fields, context);
	}

	async _pongPost(link, data, context) {
		const pong = await this.ping(void 0, context);
		return this.post(pong.getLink(link), data, context);
	}
}
