import EventEmitter from 'events';
import Url from 'url';
//If the login method is invoked on the NodeJS side, we will need this function...
import base64decode from 'btoa';

import Logger from 'nti-util-logger';

import DataCache from '../utils/datacache';
import MimeComparator from '../utils/MimeComparator';


import parseBody from '../utils/attempt-json-parse';
import getContentType from '../utils/get-content-type-header';
import getLink, {getLinks} from '../utils/getlink';
import encodeFormData from '../utils/encode-form-data';
import toObject from '../utils/to-object';

import chain from 'nti-commons/lib/function-chain';

import {attach as attachPendingQueue} from '../models/mixins/Pendability';

import Service from '../stores/Service';

import {SiteName, REQUEST_CONFLICT_EVENT, TOS_NOT_ACCEPTED} from '../constants';

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
		const mime = accept && new MimeComparator(accept);

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

		if (data && typeof data === 'object') {
			if (data[AsFormSubmission]) {
				init.body = encodeFormData(data);
			}
			else {
				init.body = JSON.stringify(data);
				init.headers['Content-Type'] = 'application/json';
			}
		}

		let abortMethod; //defined inside the promise
		const result = new Promise((fulfill, reject) => {
			let abortFlag = false;

			logger.debug('REQUEST <- %s %s', init.method, url);

			if (context) {
				if(context.dead) {
					return reject('request/connection aborted');
				}

				if (context.on) {
					const abort = ()=> abortMethod();
					const clean = event => context.removeListener(event, abort);
					const n = ()=> (clean('aborted'), clean('close'));

					fulfill = chain(fulfill, n);
					reject = chain(reject, n);

					context.on('aborted', abort);
					context.on('close', abort);
				}
			}

			const maybeFulfill = (...args) => !abortFlag && fulfill(...args);
			const maybeReject = (...args) => !abortFlag && reject(...args);

			const checkStatus = (response) => {
				if (response.ok) {
					return response;
				} else {
					logger.debug('REQUEST -> %s %s %s %dms', init.method, url, response.statusText, Date.now() - start);

					let error = Object.assign(new Error(response.statusText), {
						Message: response.statusText,
						response,
						statusCode: response.status
					});

					return response.json()
						.then(json => {
							Object.assign(error, json);

							const confirmLink = response.status === 409 && getLink(json, 'confirm');

							if (confirmLink) {
								error.confirm = () => this.put(confirmLink, data, context);
								let confirm;
								const waitOn = new Promise((...args) => {
									confirm = () => error.confirm().then(...args);
								});

								// We're expecting a top-level App-Wide component to listen and handle this event.
								// Allowing for a Centralized Conflict Resolver.  If this is not handled, we will
								// continue to reject (leaving a confirm method).
								if (this.emit(REQUEST_CONFLICT_EVENT, {...json, confirm})) {
									//Reject with an object that has a key 'skip' which is our confirm Promise
									//...so we can skip the parsing and body handling below. (the confirm will
									// do that work for itself)
									return Promise.reject({skip: waitOn});
								}
							}

							return Promise.reject(error);
						})
						.catch(reason =>
							// If this is our skip object, pass it on. Otherwise,
							// its an unknown error and just reject with the error above.
							Promise.reject(reason.skip ? reason : error));
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

			abortMethod = ()=> { abortFlag = true; reject('aborted'); };
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
			promise = this.get(null, context)
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


	logInOAuth (url) {
		return this[Request]({
			url: url
		});
	}


	ping (context, username) {
		username = username || (context && context.cookies && context.cookies.username);

		let me = this;

		return me.get('logon.ping', context)//ping
			//pong
			.then(data => {
				let urls = toMap(getLinks(data));

				if (!urls['logon.handshake']) {
					return Promise.reject('No handshake present');
				}

				if (context && data && data.Site) {
					context[SiteName] = data.Site;
				}

				return urls;

			})
			.then(urls => {

				if (!username) {
					return (!urls['logon.continue']) ?
						//Not logged in... we need the urls
						{links: urls} :
						//There is a continue link, but we need our username to handshake...
						me.getServiceDocument(context)
							.then(d => me.handshake(urls, (username = d.getAppUsername()), context));
				}

				return me.handshake(urls, username, context);

			});
	}


	handshake (urls, username, context) {
		return this.post(urls['logon.handshake'], {[AsFormSubmission]: true, username}, context)
			.then(data => {
				const result = {links: Object.assign({}, urls, toMap(getLinks(data)))};
				if (!getLink(data, 'logon.continue')) {
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
				this[Request]({
					url: result.links['account.preflight.create'],
					headers: {
						'Content-type': 'application/json'
					},
					data: JSON.stringify(fields)
				}, context)
			);
	}


	createAccount (fields, context) {
		return this.ping(context)
			.then(result =>
				this[Request]({
					url: result.links['account.create'],
					headers: {
						'Content-type': 'application/json'
					},
					data: JSON.stringify(fields)
				}, context)
			);
	}

}


//Used to flatten links into a dictionary of rel: link.
//ONLY used for login where all the metadata is not needed. (yet)
function toMap (o, m = {}) {
	for (let v of o) { m[v.rel] = v.href; }
	return m;
}
