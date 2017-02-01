import EventEmitter from 'events';
import Url from 'url';
//If the login method is invoked on the NodeJS side, we will need this function...
import base64decode from 'btoa';
import QueryString from 'query-string';

import Logger from 'nti-util-logger';

import DataCache from '../utils/datacache';


import parseBody from '../utils/attempt-json-parse';
import getContentType from '../utils/get-content-type-header';
import getLink, {getLinks} from '../utils/getlink';
import encodeFormData from '../utils/encode-form-data';
import toObject from '../utils/to-object';

import {chain, FileType} from 'nti-commons';

import {attach as attachPendingQueue} from '../mixins/Pendability';

import Service from '../stores/Service';

import {SiteName, REQUEST_CONFLICT_EVENT, REQUEST_ERROR_EVENT, TOS_NOT_ACCEPTED} from '../constants';

const logger = Logger.get('DataServerInterface');

const btoa = global.bota || base64decode;

const Request = Symbol('Request Adaptor');
const AsFormSubmission = Symbol('');


export default class DataServerInterface extends EventEmitter {

	constructor (config) {
		super();
		if (!config || !config.server) {
			throw new Error('No configuration');
		}
		this.config = config;
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
	 * @param {object} [options.headers] - HTTP headers to add to the request.
	 * @param {object} [context] - An active request context to the node's "express" http server.
	 * @returns {Promise} The promise of data or rejection ;)
	 * @private
	 */
	[Request] (options, context) {
		//covers more than just undefined. (false, 0, null, and undefined.)
		//Make sure options is the normalize shape.
		options = (options && (typeof options === 'object' ? options : {url: options})) || {};

		const start = Date.now();
		const url = Url.parse(this.config.server)
						.resolve(options.url || '');


		const {data} = options;
		const {accept} = options.headers || {};
		const mime = accept && new FileType.MimeComparator(accept);

		const init = {
			credentials: 'same-origin',
			method: data ? 'POST' : 'GET',
			...options
		};

		if (options.headers !== null) {
			init.headers = {
				...options.headers,

				//Always override these headers
				'accept': mime || 'application/json',
				'X-Requested-With': 'XMLHttpRequest'
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
			//have an unset init.body unless we neeeded to encode it...
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

			logger.debug('REQUEST <- %s %s', init.method, url);

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
				if (response.ok) {
					return response;
				} else {
					logger.debug('REQUEST -> %s %s %s %dms', init.method, url, response.statusText, Date.now() - start);

					const error = Object.assign(new Error(response.statusText), {
						Message: response.statusText,
						response,
						statusCode: response.status
					});

					return response.json()
						.then(json => {
							Object.assign(error, json);

							const confirmLink = response.status === 409 && getLink(json, 'confirm');

							if (confirmLink) {
								error.confirm = () => this[Request]({ url: confirmLink, method: init.method, data }, context);
								let confirm;
								let reject;
								const waitOn = new Promise((continueRequest, rejectConflict) => {
									confirm = () => error.confirm().then(continueRequest, rejectConflict);
									reject = () => rejectConflict(error);
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
				.catch(() => Promise.reject({Message: 'Request Failed.', statusCode: 0}))
				.then(checkStatus)

				//Parsing response
				.then(response => abortFlag
									? Promise.reject('Aborted')
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

			abortMethod = ()=> { abortFlag = true; rejectRequest('aborted'); };
		});

		result.abort = abortMethod || (()=> logger.warn('Attempting to abort request, but missing abort() method.'));

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


	getServiceDocument (context) {
		let cache = DataCache.getForContext(context),
			cached = cache.get('service-doc-instance'),
			promise;

		let set = x => cache.setVolatile('service-doc-instance', x);

		//Do we have an instance?
		if (cached) {
			return Promise.resolve(cached);
		}

		//Do we have the data to build an instance?
		cached = cache.get('service-doc');
		if (cached) {
			promise = Promise.resolve(new Service(cached, this, context));
		//No? okay... get the data and build and instance
		}
		else {
			promise = this.ping(context)
				.then(result => result.getLink('logon.continue') || Promise.reject('No Service URL'))
				.then(serviceUrl => this.get(serviceUrl, context))
				.then(json =>
					cache.set('service-doc', json) &&
					new Service(json, this, context));
		}

		promise = promise.then(doc => doc.waitForPending()
				.then(() => Promise.resolve(doc)));

		//once we have an instance, stuff it in the cache so we don't keep building it.
		promise.then(set);
		//until the promise resolves, cache the promise itself. (Promise.resolve()
		//when given a promise, will resolve when the passed promise resolves)
		set(promise);

		//Return a promise that will fulfill with the instance...
		return promise;
	}


	logInPassword (url, username, password) {
		if (typeof username === 'object') {
			password = username.password || void 0;
			username = username.username || void 0;
		}

		let auth = password ? ('Basic ' + btoa(username + ':' + password)) : undefined;
		let options = {
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
		//OAuth logins only work client side, so this method will only work in a browser, and will fail on node.
		let href = Url.parse(url);

		href.search = QueryString.stringify({
			...QueryString.parse(href.search),
			success: successUrl,
			failure: failureUrl
		});

		global.location.replace(href.format());
	}


	ping (context, username) {
		username = username || (context && context.cookies && context.cookies.username);

		return this.get('logon.ping', context)//ping
			//pong
			.then(pong => {

				if (!getLink(pong, 'logon.handshake')) {
					return Promise.reject('No handshake present');
				}

				if (context && pong && pong.Site) {
					context[SiteName] = pong.Site;
				}

				if (!username) {
					return (!getLink(pong, 'logon.continue'))
						//Not logged in... we need the urls
						? {
							pong,
							//FIXME: This version of "links" is deprecated... use getLink() or hasLink() on the result object.
							links: toMap(getLinks(pong)),
							getLink: (rel) => getLink(pong, rel),
							hasLink: (rel) => !!getLink(pong, rel)
						}
						//There is a continue link, but we need our username to handshake...
						: this.handshake(pong, (username = pong.AuthenticatedUsername), context);
				}

				return this.handshake(pong, username, context);

			});
	}


	handshake (pong, username, context) {
		const data = !username ? {} : {username};
		return this.post(getLink(pong, 'logon.handshake'), {[AsFormSubmission]: true, ...data}, context)
			.then(handshake => {

				const result = {
					pong,
					handshake,
					//FIXME: This version of "links" is deprecated... use getLink() or hasLink() on the result object.
					links: {
						...toMap(getLinks(pong)),
						...toMap(getLinks(handshake))
					},
					getLink: (rel) => getLink(handshake, rel) || getLink(pong, rel),
					hasLink: (rel) => !!(getLink(handshake, rel) || getLink(pong, rel))
				};

				if (!getLink(handshake, 'logon.continue')) {
					result.reason = 'Not authenticated, no continue after handshake.';
					return Promise.reject(result);
				}
				return result;
			});
	}


	deleteTOS (context) {
		return this.ping(context)
			.then(result => {
				let link = result.links[TOS_NOT_ACCEPTED];
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

				this.post(result.links['logon.forgot.username'], {
					[AsFormSubmission]: true,
					email
				}, context)

			);
	}


	recoverPassword (email, username, returnURL, context) {
		return this.ping(context)
			.then(result =>

				this.post(result.links['logon.forgot.passcode'], {
					[AsFormSubmission]: true,
					email, username,
					success: returnURL
				}, context)

			);
	}


	resetPassword (username, password, id, context) {
		return this.ping(context)
			.then(result =>
				this.post(result.links['logon.reset.passcode'], {
					[AsFormSubmission]: true,
					id, username, password
				}, context)
			);
	}


	preflightAccountCreate (fields, context) {
		return this.ping(context)
			.then(result =>
				this.post(result.links['account.preflight.create'], fields, context)
			);
	}


	createAccount (fields, context) {
		return this.ping(context)
			.then(result =>
				this.post(result.links['account.create'], fields, context)
			);
	}

}


//Used to flatten links into a dictionary of rel: link.
//ONLY used for login where all the metadata is not needed. (yet)
function toMap (o, m = {}) {
	for (let v of o) { m[v.rel] = v.href; }
	return m;
}
