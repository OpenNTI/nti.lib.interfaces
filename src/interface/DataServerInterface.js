/*globals BUILD_PACKAGE_NAME, BUILD_PACKAGE_VERSION*/
import EventEmitter from 'events';

import Logger from '@nti/util-logger';
import { chain, FileType, URL } from '@nti/lib-commons';

import DataCache from '../utils/datacache';
import parseBody from '../utils/attempt-json-parse';
import getContentType from '../utils/get-content-type-header';
import getLink, { getLinks } from '../utils/getlink';
import encodeFormData from '../utils/encode-form-data';
import toObject from '../utils/to-object';
import { getTimezone } from '../utils/timezone';
import { attach as attachPendingQueue } from '../mixins/Pendability';
import Service from '../stores/Service';
import {
	SiteName,
	REQUEST_CONFLICT_EVENT,
	REQUEST_ERROR_EVENT,
	TOS_NOT_ACCEPTED
} from '../constants';

const CONTINUE = 'logon.continue';
const CONTINUE_ANONYMOUSLY = 'logon.continue-anonymously';
const HANDSHAKE = 'logon.handshake';

const SERVICE_DATA_CACHE_KEY = 'service-doc';
const SERVICE_INST_CACHE_KEY = 'service-doc-instance';

const logger = Logger.get('DataServerInterface');

const {btoa} = global;

const Request = Symbol('Request Adaptor');
const AsFormSubmission = Symbol('');


export default class DataServerInterface extends EventEmitter {

	constructor (config) {
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
			const headers = this.headers = {};

			//App Identifier headers
			if (typeof BUILD_PACKAGE_NAME !== 'undefined') {
				headers['X-NTI-Client-App'] = BUILD_PACKAGE_NAME;
			}

			if (typeof BUILD_PACKAGE_VERSION !== 'undefined') {
				headers['X-NTI-Client-Version'] = BUILD_PACKAGE_VERSION;
			}

			const {offset, name} = getTimezone();
			headers['X-NTI-Client-TZOffset'] = offset;
			headers['X-NTI-Client-Timezone'] = name;

		} catch (e) {
			logger.warn('Could not set all custom headers: %s', e.stack || e.message || e);
		}
	}


	dispatch (...args) {
		if (this.config.dispatch) {
			this.config.dispatch.call(null, args);
		}
	}


	/**
	 * Add/Set header values to be sent with all requests.
	 *
	 * @method setDefaultHeaders
	 * @param  {Object}          headers A simple object with Keys/Value pairs for header/value pairs.
	 * @return {void}
	 */
	setDefaultHeaders (headers) {
		this.headers = {
			...this.headers || {},
			...headers
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
	 * @param {object} [options.data] - A dictionary of form values to send with the request.
	 * @param {boolean} [options.blob] - return a blob
	 * @param {object} [options.headers] - HTTP headers to add to the request.
	 * @param {object} [context] - An active request context to the node's "express" http server.
	 * @returns {Promise} The promise of data or rejection ;)
	 * @private
	 */
	[Request] (options, context) {
		const id = this.nextRequestId++;
		//covers more than just undefined. (false, 0, null, and undefined.)
		//Make sure options is the normalize shape.
		options = (options && (typeof options === 'object' ? options : {url: options})) || {};

		const start = Date.now();
		const url = URL.resolve(this.config.server, options.url || '');

		delete options.url; //make sure we only give fetch() one url...

		const {data, blob} = options;
		const {accept} = options.headers || {};
		const mime = accept && new FileType.MimeComparator(accept);

		const init = {
			credentials: 'same-origin',
			method: data ? 'POST' : 'GET',
			...options
		};

		//setting options.headers to explicitly null will prevent our standard headers from being applied
		if (options.headers !== null) {
			init.headers = {
				...options.headers,
				...(this.headers || {}),

				//Always override these headers
				'accept': mime || (blob ? void 0 : 'application/json'),
				'x-requested-with': 'XMLHttpRequest'
			};
		}

		if(context) {
			init.headers = {
				...(context.headers || {}),
				...init.headers,
				'accept-encoding': ''
			};

			delete init.headers['content-length'];
			delete init.headers['content-type'];
			delete init.headers['referer'];

		} else if (!process.browser) {
			throw new Error('Calling request w/o context!');
		}

		if (data != null) {
			//fetch() api only allows the init.body to be an instance of these things:
			//ArrayBuffer, ArrayBufferView, Blob/File, URLSearchParams, FormData or a string
			//typeof will return === 'object' for all but strings... so with the above, we will
			//have an unset init.body unless we need to encode it...
			const useDataRaw = (typeof FormData !== 'undefined' && data instanceof FormData)
							|| (typeof Blob !== 'undefined' && data instanceof Blob)
							|| (typeof File !== 'undefined' && data instanceof File)
							|| (data.buffer != null && data.BYTES_PER_ELEMENT != null)//all TypedArrays (ArrayBufferView)
							|| (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer)
							|| (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams)
							|| typeof data === 'string';

			init.body = (data[AsFormSubmission])
				? encodeFormData(data)
				: useDataRaw
					? data
					: JSON.stringify(data);

			if (!useDataRaw && !data[AsFormSubmission]) {
				init.headers['Content-Type'] = 'application/json';
			}
		}

		let abortMethod; //defined inside the promise
		const result = new Promise((fulfillRequest, rejectRequest) => {
			let abortFlag = false;
			abortMethod = ()=> { abortFlag = true; rejectRequest('aborted'); };

			logger.debug('REQUEST %d (send) -> %s %s', id, init.method, url);
			// logger.debug('REQUEST %d HEADERS: %s %s:\n%o', id, init.method, url, init.headers);

			if (context) {
				if(context.dead) {
					return rejectRequest('request/connection aborted');
				}

				if (context.on) {
					const abort = ()=> abortMethod();
					const clean = event => context.removeListener(event, abort);
					const n = ()=> (clean('aborted'), clean('close'));

					fulfillRequest = chain(fulfillRequest, n);
					rejectRequest = chain(rejectRequest, n);

					context.on('aborted', abort);
					context.on('close', abort);
				}
			}

			const maybeFulfill = (...args) => !abortFlag && fulfillRequest(...args);
			const maybeReject = (...args) => !abortFlag && rejectRequest(...args);

			const checkStatus = (response) => {
				logger.debug('REQUEST %d (recv) <- %s %s %s %dms', id, init.method, url, response.statusText, Date.now() - start);
				if (response.ok) {
					return response;
				} else {

					const error = Object.assign(new Error(response.statusText), {
						Message: response.statusText,
						response,
						statusCode: response.status
					});

					return response.json()
						.then(json => {
							json.Message = json.Message || json.message;

							Object.assign(error, json);

							const isConflict = response.status === 409;

							if (isConflict) {
								error.confirm = (config = {}) => {
									const {rel = 'confirm', data:conflictData} = config;
									const link = getLink(json, rel, true);
									const {method, href} = link;
									const newData = method === 'GET' ? null : conflictData || data;

									if (!href) {
										return Promise.reject(error);
									}

									return this[Request]({url: href, method: method || init.method, data: newData}, context);
								};

								let confirm;
								let reject;

								const waitOn = new Promise((continueRequest, rejectConflict) => {
									confirm = (...args) => error.confirm(...args).then(continueRequest, rejectConflict);
									reject = () => rejectConflict(Object.assign(error, {resolved: true}));
								});


								// We're expecting a top-level App-Wide component to listen and handle this event.
								// Allowing for a Centralized Conflict Resolver.  If this is not handled, we will
								// continue to reject (leaving a confirm method).
								if (this.emit(REQUEST_CONFLICT_EVENT, {...json, confirm, reject})) {
									//Reject with an object that has a key 'skip' which is our confirm Promise
									//...so we can skip the parsing and body handling below. (the confirm will
									// do that work for itself)
									return Promise.reject({skip: waitOn});
								}
							}

							return Promise.reject(error);
						})
						.catch(reason => (
							//Let the world know there was a request failure...and let them potentially display/act on it
							!reason.skip && this.emit(REQUEST_ERROR_EVENT, error),

							// If this is our skip object, pass it on. Otherwise,
							// its an unknown error and just reject with the error above.
							Promise.reject(reason.skip ? reason : error)
						));
				}
			};

			fetch(url, init)
				.catch(e => Promise.reject({Message: 'Request Failed.', statusCode: 0, error: e}))
				.then(checkStatus)

				//Parsing response
				.then(response => abortFlag
					? Promise.reject('Aborted')
					: blob ? Promise.reject({skip: response.blob()})
						: response.text()//we don't use .json() because we need to fallback if it doesn't parse.
							.then(parseBody)
							.then(body => ({response, body})))

				//Handle cookies and validate mimes. (server side stuff mostly)
				.then(({body, response}) => {

					const headers = toObject(response.headers);
					if (headers['set-cookie'] && context) {
						context.responseHeaders = context.responseHeaders || {};
						context.responseHeaders['set-cookie'] = headers['set-cookie'];
					}

					//If sent an explicit Accept header the server
					//may return a 406 if the Accept value is not supported
					//or it may just return whatever it wants.  If we send
					//Accept we check the Content-Type to see if that is what
					//we get back.  If it's not, we reject.
					if (mime) {
						const contentType = getContentType(headers);
						if (!mime.is(contentType)) {
							return Promise.reject('Requested with an explicit accept value of ' +
											mime + ' but got ' + contentType + '.  Rejecting.');
						}
					}

					return body;
				})

				//handle some checkStatus errors, or pass them on
				.catch(reason =>
					reason.skip || Promise.reject(reason))

				//finally, finish
				.then(maybeFulfill, maybeReject);
		});

		result.abort = abortMethod || (()=> logger.warn('REQUEST %d: Attempting to abort request, but missing abort() method.', id));

		if (context) {
			attachPendingQueue(context).addToPending(result);
		}
		return result;
	}


	get (url, context) {
		return this[Request](url, context);
	}


	post (url, data, context) {
		return this[Request]({
			url: url,
			method: 'POST',
			data: data
		}, context);
	}


	put (url, data, context) {
		return this[Request]({
			url: url,
			method: 'PUT',
			data: data
		}, context);
	}


	delete (url, context) {
		return this[Request]({
			url: url,
			method: 'DELETE'
		}, context);
	}


	getServiceDocument (context, options) {
		const {refreshing} = options || {};
		const cache = DataCache.getForContext(context);
		const cached = cache.get(SERVICE_INST_CACHE_KEY);

		const set = x => cache.setVolatile(SERVICE_INST_CACHE_KEY, x);

		//Do we have an instance? (and we're not refreshing...)
		if (cached && !refreshing) {
			return Promise.resolve(cached);
		}

		const NO_LINK = Object.assign(
			//captures the initial call site.
			new Error('No continue link. Cannot fetch service document.'), {
				NoContineLink: true
			}
		);
		const data = cache.get(SERVICE_DATA_CACHE_KEY);
		const promise = (
			//Do we have the data to build an instance? (are we're not freshing...)
			(data && !refreshing)

				// Yes...
				? Promise.resolve(new Service(data, this, context))

				//No... okay... get the data, but first we have to perform a ping/handshake...
				: this.ping(context)

					// now we can get the url of the service doc...
					.then(result =>
						result.getLink(CONTINUE)
						|| result.getLink(CONTINUE_ANONYMOUSLY)
						|| Promise.reject(NO_LINK)
					)

					// With the url, we can finally load...
					.then(serviceUrl => this.get(serviceUrl, context))

					// Now that we have the data, save it into cache...
					.then(json => cache.set(SERVICE_DATA_CACHE_KEY, json) && json)

					//Setup our Service instance...
					.then(json => !cached
						//If we're not freshing, build a new Service...
						? new Service(json, this, context)
						// Otherwise, update the existing one...
						: Promise.resolve(cached) // "cached" may be a promise, so resolve/unwrap it first.
							// Now we can apply the new data.
							.then(doc => doc.assignData(json))
					)
		)
			// Wait for all the tasks that got spun up when we parsed the data...
			.then(doc => doc.waitForPending()); // waitForPending resolves with itself ("doc" in this case)

		//once we have an instance, stuff it in the cache so we don't keep building it.
		promise.then(set, () => {});//This forked promise needs to handle the rejection (the noop).

		//until the promise resolves, cache the promise itself. (Promise.resolve()
		//when given a promise, will resolve when the passed promise resolves)
		set(promise);

		//Return a promise that will fulfill with the instance...
		return promise;
	}


	refreshServiceDocument (context) {
		// load the service fresh, and apply data onto the existing service doc.
		return this.getServiceDocument(context, {refreshing: true});
	}


	logInPassword (url, username, password) {
		if (typeof username === 'object') {
			password = username.password || void 0;
			username = username.username || void 0;
		}

		const auth = password ? ('Basic ' + btoa(username + ':' + password)) : undefined;
		const options = {
			url: url,
			method: 'GET',
			xhrFields: { withCredentials: true },
			headers: {
				Authorization: auth
			}
		};
		return this[Request](options);
	}


	logInOAuth (url, successUrl, failureUrl) {
		const href = this.computeOAuthUrl(url, successUrl, failureUrl);
		global.location.replace(href);
	}


	computeOAuthUrl (url, successUrl, failureUrl) {
		//OAuth logins only work client side, so this method will only work in a browser, and will fail on node.
		return URL.appendQueryParams(url, {
			success: successUrl,
			failure: failureUrl
		});
	}


	async ping (username, context) {
		if ((arguments.length === 1 && typeof username === 'object')
		||  (arguments.length === 2 && typeof context === 'string')) {
			console.trace('Is this still needed?');
			//swap values for api back-compat
			[username, context] = [context, username];
		}

		username = username || (context && context.cookies && context.cookies.username);

		const pong = await this.get('logon.ping', context);

		if (context && pong && pong.Site) {
			// eslint-disable-next-line require-atomic-updates
			context[SiteName] = pong.Site;
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
					hasLink: (rel) => !!getLink(pong, rel)
				};
			}

			//There is a continue link, but we need our username to handshake...
			username = pong.AuthenticatedUsername;
		}

		return this.handshake(pong, username, context);
	}


	async handshake (pong, username, context) {
		const data = !username ? {} : {username};
		const handshake = await this.post(getLink(pong, HANDSHAKE), {[AsFormSubmission]: true, ...data}, context);
		const result = {
			pong,
			handshake,
			links: [...(new Set([
				...getLinks(pong).map(x => x.rel),
				...getLinks(handshake).map(x => x.rel)
			]))],
			getLink: (...rel) => getLink(handshake, ...rel) || getLink(pong, ...rel),
			hasLink: (rel) => !!(getLink(handshake, rel) || getLink(pong, rel))
		};

		if (!result.getLink(CONTINUE)) {
			result.reason = 'Not authenticated, no continue after handshake.';
			return Promise.reject(result);
		}
		return result;
	}


	deleteTOS (context) {
		return this.ping(context)
			.then(result => {
				let link = result.getLink(TOS_NOT_ACCEPTED);
				if (link) {
					return this.delete(link, context);
				}
				//wut?
				return 'initial_tos_page link not present.';
			});
	}


	recoverUsername (email, context) {
		return this.ping(context)
			.then(result =>

				this.post(result.getLink('logon.forgot.username'), {
					[AsFormSubmission]: true,
					email
				}, context)

			);
	}


	recoverPassword (email, username, returnURL, context) {
		return this.ping(context)
			.then(result =>

				this.post(result.getLink('logon.forgot.passcode'), {
					[AsFormSubmission]: true,
					email, username,
					success: returnURL
				}, context)

			);
	}


	resetPassword (username, password, id, context) {
		return this.ping(context)
			.then(result =>
				this.post(result.getLink('logon.reset.passcode'), {
					[AsFormSubmission]: true,
					id, username, password
				}, context)
			);
	}


	preflightAccountCreate (fields, context) {
		return this.ping(context)
			.then(result =>
				this.post(result.getLink('account.preflight.create'), fields, context)
			);
	}


	createAccount (fields, context) {
		return this.ping(context)
			.then(result =>
				this.post(result.getLink('account.create'), fields, context)
			);
	}

}
