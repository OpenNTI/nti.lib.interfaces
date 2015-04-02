
import Url from 'url';
//If the login method is invoked on the NodeJS side, we will need this function...
import base64decode from 'btoa';
import QueryString from 'query-string';
import request from '../utils/request';
import logger from '../logger';

import DataCache from '../utils/datacache';

import isBrowser from '../utils/browser';
import isEmpty from '../utils/isempty';
import {isNTIID} from '../utils/ntiids';
import waitFor from '../utils/waitfor';
import getLink, {asMap as getLinksAsMap} from '../utils/getlink';

import chain from '../utils/function-chain';

import Service from '../stores/Service';

import {Pending, SiteName} from '../CommonSymbols';

const btoa = global.bota || base64decode;
const jsonContent = /(application|json)/i;
const mightBeJson = /^(\s*)(\{|\[|"|')/i;

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
	 * @param {Object/String} [options] - Request options or URL.
	 * @param {String} [options.url] - The dataserver resource we wish to make the request for, or an absolute url.
	 * @param {String} [options.method] - defaults to GET, and POST if `form` is set.
	 * @param {Object} [options.data] - A dictionary of form values to send with the request.
	 * @param {Object} [options.headers] - HTTP headers to add to the request.
	 * @param {Object} [context] - An active request context to the node's "express" http server.
	 * @returns {Promise}
	 * @private
	 */
	_request (options, context) {

		let result;
		let abortMethod;
		let pending = context ? (context.__pendingServerRequests = (context.__pendingServerRequests || [])) : [];
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
				'x-requested-with': 'XMLHttpRequest'
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
			if (typeof data === 'object' && !data._asFORM) {
				opts.headers['Content-type'] = 'application/json';
			}
			delete data._asFORM;
		}

		function getContentType(headers) {
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
					res = {headers:{}};
				}

				let contentType = getContentType(res.headers);
				let code = res.statusCode;

				try {
					if (isEmpty(contentType) || jsonContent.test(contentType) || mightBeJson.test(body)) {
						body = JSON.parse(body);
					}
				} catch (e) {}//Don't care... let it pass to the client as a string

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
					if (contentType && contentType.indexOf(mime) < 0) {
						return reject('Requested with an explicit accept value of ' +
										mime + ' but got ' + contentType + '.  Rejecting.');
					}
				}


				fulfill(body);
			});

			abortMethod = ()=>{ active.abort(); reject('aborted'); };
		});

		result.abort = abortMethod || ()=> logger.info('Attempting to abourt request, but missing abort() method.');

		pending.push(result);
		return result;
	}


	_get (url, context) {
		return this._request(url, context);
	}


	_post (url, data, context) {
		return this._request({
			url: url,
			method: 'POST',
			data: data
		}, context);
	}


	_put (url, data, context) {
		return this._request({
			url: url,
			method: 'PUT',
			data: data
		}, context);
	}


	_delete (url, context) {
		return this._request({
			url: url,
			method: 'DELETE'
		}, context);
	}


	getPurchasables  (ids, context) {
		console.debug('{FIXME} does not belong here');
		let url = '/dataserver2/store/get_purchasables';

		if (ids) {
			if (Array.isArray(ids)) {
				ids = ids.join(',');
			}

			url += '?' + QueryString.stringify({
				purchasables: ids
			});
		}

		return this._get(url, context);
	}



	getServiceDocument (context) {
		let cache = DataCache.getForContext(context),
			cached = cache.get('service-doc-instance'),
			promise;

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
			promise = this._get(null, context)
				.then(json =>
					cache.set('service-doc', json) &&
					new Service(json, this, context))

				.then(doc =>
					waitFor(doc[Pending])
						.then(() => Promise.resolve(doc)));
		}

		//once we have an instance, stuff it in the cache so we don't keep building it.
		promise.then(instance =>
			cache.setVolatile('service-doc-instance', instance));

		//Return a promise that will fulfill with the instance...
		return promise;
	}


	logInPassword (url,credentials) {
		let username = credentials ? credentials.username : undefined;
		let password = credentials ? credentials.password : undefined;
		let auth = password ? ('Basic ' + btoa(username+':'+password)) : undefined;
		let options = {
			url: url,
			method: 'GET',
			xhrFields: { withCredentials: true },
			headers: {
				Authorization: auth
			}
		};
		return this._request(options);
	}


	logInOAuth (url) {
		return this._request({
			url: url
		});
	}


	ping (context, username) {
		username = username || (context && context.cookies && context.cookies.username);

		let me = this;

		return me._get('logon.ping', context)//ping
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


	handshake  (urls, username, context) {
		return this._post(urls['logon.handshake'], {_asFORM: true, username: username}, context)
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
				let link = result.links['content.initial_tos_page'];
				if (link) {
					return this._delete(link, context);
				}
				//wut?
				return 'initial_tos_page link not present.';
			});
	}


	recoverUsername (email, context) {
		return this.ping(context)
			.then(result =>

				this._post(result.links['logon.forgot.username'], {
					_asFORM: true,
					email: email
				}, context)

			);
	}


	recoverPassword (email, username, returnURL, context) {
		return this.ping(context)
			.then(result =>

				this._post(result.links['logon.forgot.passcode'], {
					_asFORM: true,
					email: email,
					username: username,
					success: returnURL
				}, context)

			);
	}


	resetPassword (username, newpw, id, context) {
		return this.ping(context)
			.then(result =>
				this._post(result.links['logon.reset.passcode'], {
					_asFORM: true,
					username: username,
					id: id,
					password: newpw
				}, context)
			);
	}


	preflightAccountCreate (fields, context) {
		return this.ping(context)
			.then(result =>
				this._request({
					url: result.links['account.preflight.create'],
					headers: {
						'Content-type':'application/json'
					},
					data: JSON.stringify(fields)
				}, context)
			);
	}


	createAccount (fields, context) {
		return this.ping(context)
			.then(result =>
				this._request({
					url: result.links['account.create'],
					headers: {
						'Content-type':'application/json'
					},
					data: JSON.stringify(fields)
				}, context)
			);
	}


	getObject (ntiid, mime, context) {
		if (!isNTIID(ntiid)) {
			return Promise.reject('Bad NTIID');
		}

		return this.getServiceDocument(context)
			.then(doc => {
				let headers = {},
					url = doc.getObjectURL(ntiid);

				if (mime) {
					url = Url.parse(url);
					url.search = QueryString.stringify(Object.assign(
						QueryString.parse(url.query), {
							type: mime
						}));

					url = url.format();
					headers.accept = mime;
				}

				return this._request({url: url, headers: headers}, context);
			});
	}


	getObjects (ntiids, context) {
		if (!Array.isArray(ntiids)) {
			ntiids = [ntiids];
		}

		let me = this;

		return Promise.all(ntiids.map(n =>
			me.getObject(n, undefined, context)))
				.then(results =>
					(!Array.isArray(results) ? [results] : results).map(o=>o && o.MimeType ? o : null)
				);

	}


	getPageInfo (ntiid, context) {
		let mime = 'application/vnd.nextthought.pageinfo+json';

		if (!isNTIID(ntiid)) {
			return Promise.reject('Bad NTIID');
		}

		return this.getObject(ntiid, mime, context);
	}
}
