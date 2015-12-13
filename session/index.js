//import Catalog from '../stores/Catalog';
import Library from '../stores/Library';
import Logger from '../logger';
// import Notifications from '../stores/Notifications';

import {ServiceStash} from '../CommonSymbols';

const logger = Logger.get('SessionManager');

const TOS = Symbol();

export default class SessionManager {
	constructor (server) {
		if (!server) {
			throw new Error('No server interface!');
		}
		this.server = server;
		this.config = server.config;
	}


	getUser (context) {

		return this.getServiceDocument(context)
			.then(doc => {
				let w = doc.getUserWorkspace();
				if (w) {
					return w.Title;
				}
				return Promise.reject('No user workspace');
			});

	}


	getServiceDocument (context) {
		let server = this.server;
		return server.ping(context)
			.then(pong => server.getServiceDocument(context)
				.then(service => {
					service.setLogoutURL(pong.links['logon.logout']);
					return service;
				}));
	}


	setupIntitalData (context) {
		let url = context.originalUrl || context.url;
		logger.debug('SESSION [PRE-FETCHING DATA] %s %s (User: %s)', context.method, url, context.username);
		return this.server.getServiceDocument(context)
			.then(service => {
				context[ServiceStash] = service;

				return service.getAppUser()
					.then(user => {
						if (user.acceptTermsOfService) {
							logger.error('User needs to accept terms of service.');
							return Promise.reject(TOS);
						}
					})
					.then(() => Promise.all([
						service,
						Library.load(service, 'Main')//,
						//Catalog.load(service),
						//Notifications.load(service)
					]));

			});
	}


	middleware (req, res, next) {
		let start = Date.now();
		let url = req.originalUrl || req.url;
		let basepath = this.config.basepath || '/';
		let scope = url.substr(0, basepath.length) === basepath ? url.substr(basepath.length) : url;

		req.responseHeaders = {};

		req.setMaxListeners(0);//unlimited
		req.socket.setKeepAlive(true, 1000);
		req.on('close', ()=> {
			req.dead = true;
			req.emit('aborted');
			next('aborted');
		});


		logger.info('SESSION [BEGIN] %s %s', req.method, url);

		function finish () {
			if (req.dead) {
				return;
			}

			try {
				res.set(req.responseHeaders);
			} catch (e) {
				logger.warn('Could not set headers because: %s (headers: %o)', e.message, req.responseHeaders);
			}
			logger.info('SESSION [END] %s %s (User: %s, %dms)',
				req.method, url, req.username, Date.now() - start);
			next();
		}

		this.getUser(req)
			.then(user => req.username = user)
			.then(()=> logger.info('SESSION [VALID] %s %s', req.method, url))
			.then(()=> !req.dead && this.setupIntitalData(req))
			.then(finish)
			.catch(reason => {
				if ((reason || {}).hasOwnProperty('statusCode')) {
					reason = reason.statusCode;
				}

				if (reason instanceof Error) {
					return next(reason);
				}

				if (reason === TOS) {
					if(/^tos/.test(scope)) {
						return next();
					}

					logger.info('SESSION [TOS NEEDS ACCEPTING] %s %s REDIRECT %stos/ (User: %s, %dms)',
						req.method, url, basepath, req.username, Date.now() - start);

					res.redirect(basepath + 'tos/?return=' + encodeURIComponent(req.originalUrl));
				}
				else if (!/^(api|login)/.test(scope)) {
					logger.info('SESSION [INVALID] %s %s REDIRECT %slogin/ (User: annonymous, %dms)',
						req.method, url, basepath, Date.now() - start);

					res.redirect(basepath + 'login/?return=' + encodeURIComponent(req.originalUrl));
				}
				else {
					logger.error('SESSION [ERROR] %s %s (%s, %dms)',
						req.method, url, reason, Date.now() - start);

					next(reason);
				}
			});
	}


	anonymousMiddleware (context, res, next) {
		this.server.ping(context)
			.then(() => next())
			.catch(err => {
				if (typeof err === 'string' || (err && err.reason)) {
					next();
				} else {
					next(err);
				}
			});
	}

}
