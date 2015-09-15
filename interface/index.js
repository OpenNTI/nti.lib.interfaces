import Url from 'url';
//If the login method is invoked on the NodeJS side, we will need this function...
import base64decode from 'btoa';

import request from '../utils/request';
import logger from '../logger';
import DataCache from '../utils/datacache';
import MimeComparator from '../utils/MimeComparator';

import isBrowser from '../utils/browser';
import isEmpty from '../utils/isempty';
import getLink, {asMap as getLinksAsMap} from '../utils/getlink';

import chain from '../utils/function-chain';

import Service from '../stores/Service';

import {Pending, SiteName} from '../CommonSymbols';
import {TOS_NOT_ACCEPTED} from '../constants';

const btoa = global.bota || base64decode;
const jsonContent = /(application|json)/i;
const mightBeJson = /^(\s*)(\{|\[|"|')/i;

const Request = Symbol('Request Adaptor');
const AsFormSubmittion = Symbol('');

export default class DataServerInterface {

	constructor (config) {
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

		let result;
		let abortMethod;
		let pending = context ? (context[Pending] = (context[Pending] || [])) : [];
		let start = Date.now();
		let url = (options || {}).url;

		if (!options) {
			options = {};
		}

		if (typeof options === 'string') {
			url = options;
			options = {};
		}

		url = Url.parse(this.config.server).resolve(url || '');

		let mime = (options.headers || {}).accept;
		let data = options.data;
		let opts = Object.assign({}, {
			method: data ? 'POST' : 'GET'
		}, options, {
			url: url//ensure the resolved url is used.
		});

		if ((options || {}).headers !== null) {
			opts.headers = Object.assign( true, ((options || {}).headers || {}), {
				//Always override these headers
				'accept': mime || 'application/json',
				'X-Requested-With': 'XMLHttpRequest'
			});
		}

		if(context) {
			opts.headers = Object.assign({},
				context.headers || {},
				opts.headers,
				{'accept-encoding': ''}
			);
		} else if (!isBrowser) {
			throw new Error('Calling request w/o context!');
		}

		if (data) {
			opts.form = data;
			if (typeof data === 'object' && !data[AsFormSubmittion]) {
				opts.headers['Content-type'] = 'application/json';
			}
			delete data[AsFormSubmittion];
		}

		function getContentType (headers) {
			let reg = /Content-Type/i;
			let key = Object.keys(headers).reduce((i, k) => i || (reg.test(k) && k), null);

			if (key) {
				return headers[key];
			}
		}

		result = new Promise((fulfill, reject) => {
			if(!isBrowser) {
				logger.info('REQUEST <- %s %s', opts.method, url);
			}

			if (context && context.dead) {
				return reject('request/connection aborted');
			}

			if (context && context.on) {
				let abort = ()=> abortMethod();
				let n = ()=> context.removeListener('abort', abort);

				fulfill = chain(fulfill, n);
				reject = chain(reject, n);

				context.on('abort', abort);
			}

			let active = request(opts, (error, res, body) => {
				if (!res) {
					logger.info('Request Options: ', opts, arguments);
					res = {headers: {}};
				}

				let contentType = getContentType(res.headers);
				let code = res.statusCode;

				try {
					if (isEmpty(contentType) || jsonContent.test(contentType) || mightBeJson.test(body)) {
						body = JSON.parse(body);
					}
				//Don't care... let it pass to the client as a string
				} catch (e) {} // eslint-disable-line no-empty

				if(!isBrowser) {
					logger.info('REQUEST -> %s %s %s %dms',
						opts.method, url, error || code, Date.now() - start);
				}

				if (error || code >= 300 || code === 0) {
					if(res) {
						if (typeof body === 'object') {
							res = Object.assign(body, {
								Message: body.Message || res.statusText,
								statusCode: code
							});
						}
					}
					return reject(error || res);
				}

				if (res.headers['set-cookie'] && context) {
					context.responseHeaders = context.responseHeaders || {};
					context.responseHeaders['set-cookie'] = res.headers['set-cookie'];
				}

				//If sent an explicit Accept header the server
				//may return a 406 if the Accept value is not supported
				//or it may just return whatever it wants.  If we send
				//Accept we check the Content-Type to see if that is what
				//we get back.  If it's not, we reject.
				if (mime) {
					mime = new MimeComparator(mime);
					if (!mime.is(contentType)) {
						return reject('Requested with an explicit accept value of ' +
										mime + ' but got ' + contentType + '.  Rejecting.');
					}
				}


				fulfill(body);
			});

			abortMethod = ()=> { active.abort(); reject('aborted'); };
		});

		result.abort = abortMethod || (()=> logger.info('Attempting to abort request, but missing abort() method.'));

		pending.push(result);
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
				let urls = getLinksAsMap(data);

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
							.then(d =>
								me.handshake(urls, (username = d.getAppUsername()), context)
							);
				}

				return me.handshake(urls, username, context);

			});
	}


	handshake (urls, username, context) {
		return this.post(urls['logon.handshake'], {[AsFormSubmittion]: true, username}, context)
			.then(data => {
				let result = {links: Object.assign({}, urls, getLinksAsMap(data))};
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
					[AsFormSubmittion]: true,
					email
				}, context)

			);
	}


	recoverPassword (email, username, returnURL, context) {
		return this.ping(context)
			.then(result =>

				this.post(result.links['logon.forgot.passcode'], {
					[AsFormSubmittion]: true,
					email, username,
					success: returnURL
				}, context)

			);
	}


	resetPassword (username, password, id, context) {
		return this.ping(context)
			.then(result =>
				this.post(result.links['logon.reset.passcode'], {
					[AsFormSubmittion]: true,
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
