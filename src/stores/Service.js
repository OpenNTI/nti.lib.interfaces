import LRU from 'lru-cache';

import Logger from '@nti/util-logger';
import { isNTIID } from '@nti/lib-ntiids';
import { url, wait } from '@nti/lib-commons';

import { BaseObservable } from '../models/AbstractModel.js';
import { parse } from '../models/Parser.js';
import { Workspace, WorkspaceCollection } from '../models/index.js';
import Capabilities from '../models/Capabilities.js';
import CommunitiesWorkspace from '../models/community/Workspace.js';
import AbstractPlaceholder from '../models/AbstractPlaceholder.js';
import Batch from '../data-sources/data-types/Batch.js';
import PageInfo from '../models/content/PageInfo.js';
import Pendability, {
	attach as attachPendingQueue,
} from '../mixins/Pendability.js';
import InstanceCacheContainer from '../mixins/InstanceCacheContainer.js';
import DataCache from '../utils/data-cache.js';
import getLink from '../utils/get-link.js';
import maybeWait from '../utils/maybe-wait.js';
import { isHrefId, decodeHrefFrom } from '../utils/href-ntiids.js';
import {
	REL_USER_SEARCH,
	REL_USER_UNIFIED_SEARCH,
	REL_USER_RESOLVE,
	REL_BULK_USER_RESOLVE,
	Context,
	Service,
} from '../constants.js';
import User from '../models/entities/User.js';

import { ChatClient } from './ChatClient.js';
import ContactsStore from './Contacts.js';
import GroupsStore from './Groups.js';
import Enrollment from './Enrollment.js';
import UserPreferences from './UserPreferences.js';

/** @typedef {import('../interface/DataServerInterface.js').default} DataServerInterface */
/** @typedef {import('../models/Model.js').default} Model */
/** @typedef {import('../utils/get-link.js').Link} Link */
/** @typedef {import('../models/entities/User.js').default} User */

const ENROLLMENT = Symbol('enrollment');

const NOT_IMPLEMENTED = 501; //HTTP 501 means not implemented

const AppUser = Symbol('LoggedInUser');
const Contacts = Symbol('Contacts');
// const Communities = Symbol('Communities');
const Groups = Symbol('Groups');
const Lists = Symbol('Lists');
const RequestEntityResolve = Symbol('RequestEntityResolve');
const USER_PREFERENCES = Symbol('UserPreferences');

const logger = Logger.get('Service');

const LibraryPathCache = new LRU({ max: 100, maxAge: 3600000 /*1 hour*/ });

const TitleSpecificWorkspaces = {
	Communities: CommunitiesWorkspace,
};

export default class ServiceDocument extends Pendability(
	InstanceCacheContainer(BaseObservable)
) {
	static ClientContext = {};

	#server = null;
	#chatClient = null;
	#pong = null;

	constructor(json, server, context) {
		super(json);

		this.isService = Service;
		this.#server = server;
		this[Service] = this; //So the parser can access it
		this[Context] =
			context === ServiceDocument.ClientContext ? void context : context;

		server
			.getPong(this[Context] || ServiceDocument.ClientContext)
			.then(pong => (this.#pong = pong));

		this.assignData(json, { silent: true });

		// Compose all request methods here so they inject the `credentials:omit` config to the request init if the service document is anonymous.
		for (const method of ['get', 'head', 'post', 'put', 'delete']) {
			const fn = this[method];
			this[method] = (init, ...args) => {
				if (this.isAnonymous) {
					if (typeof init === 'string') {
						init = { url: init };
					}
					init.credentials = 'omit';
				}

				return fn.call(this, init, ...args);
			};
		}
	}

	get OnlineStatus() {
		return this.getServer().OnlineStatus;
	}

	dispatch(...args) {
		this.getServer().dispatch(...args);
	}

	toJSON() {
		const { capabilities, Items = [], ...data } = this;
		return {
			...data,
			// This is a bandaid... once we have Collection fully defined (all fields declared) we can
			// let the builtin json-serializer do its normal thing... I just don't want to whack-a-mole
			// field names right now... :P
			Items: Items.map(x => x[Symbol.for('Raw Data')]),
			CapabilityList: capabilities,
		};
	}

	async assignData(json, { silent = false } = {}) {
		const config = this.getConfig();
		const { CapabilityList: caps = [], Items: items, ...data } = json;
		Object.assign(this, data, { appUsername: null });

		if (this.Items !== items) {
			//No mimetype on Workspace means, we have to force it...
			const parsed = (this.Items = (items || []).map(o => {
				const Cls = TitleSpecificWorkspaces[o.Title] || Workspace;

				return new Cls(this, this, o);
			}));

			this.addToPending(parsed.map(o => o?.waitForPending?.()));
		}

		this.capabilities = new Capabilities(this, caps);

		if (this.getAppUsername()) {
			let finish;
			this.addToPending(new Promise(x => (finish = x)));

			try {
				// Pre-load the app user
				await this.getAppUser();
				// update caps once we have the user (some are derived from user data)
				this.capabilities = new Capabilities(this, caps);
				if (!this.isServerSide && config.preFetchContacts) {
					await this.getContacts()?.waitForPending();
				}
			} catch (e) {
				logger.log(e.stack || e.message || e);
			} finally {
				finish();
			}
		} else {
			delete this[AppUser];
			delete this[Contacts];
		}

		if (this.isServerSide) {
			attachPendingQueue(this[Context]).addToPending(
				this.waitForPending()
			);
		}

		if (!silent) {
			this.waitForPending().then(() => this.emit('change', this));
		}

		return this;
	}

	get isServerSide() {
		return Boolean(this[Context]);
	}

	get isAnonymous() {
		return !this.getResolveAppUserURL();
	}

	//meant to be used by models and interface code. Client code should use the config getter in web-client.
	getConfig() {
		return this.getServer().config;
	}

	getSiteName() {
		return this.getConfig().siteName || this[Context]?.pong?.Site;
	}

	/** @returns {DataServerInterface} */
	getServer() {
		return this.#server;
	}

	getDataCache() {
		return DataCache.getForContext(this[Context]);
	}

	/** @returns {ChatClient} */
	getChatClient() {
		if (!this.#chatClient) {
			this.#chatClient = new ChatClient(this);
		}
		return this.#chatClient;
	}

	/** @returns {ContactsStore} */
	getContacts() {
		if (!this[Contacts]) {
			const { href } =
				this.getCollection('FriendsLists', this.getAppUsername()) || {};

			if (href) {
				this[Contacts] = new ContactsStore(
					this,
					href,
					this.getAppUserSync()
				);
			}
		}
		return this[Contacts];
	}

	getCommunities() {
		return this.Items.find(item => item.Title === 'Communities');
	}

	getGroups() {
		if (!this[Groups]) {
			let u = this[AppUser];
			let { href } =
				this.getCollection('Groups', this.getAppUsername()) || {};
			if (href) {
				this[Groups] = new GroupsStore(this, href, u);
			} else {
				logger.warn('No Groups Collection');
			}
		}

		return this[Groups];
	}

	getLists() {
		const contacts = this.getContacts();
		if (!this[Lists]) {
			this[Lists] = new Proxy(contacts, {
				get(target, prop, receiver) {
					if (prop === Symbol.iterator) {
						return function () {
							const snapshot = contacts.getLists();
							const { length } = snapshot;
							let index = 0;
							return {
								next() {
									const done = index >= length;
									const value = snapshot[index++];

									return { value, done };
								},
							};
						};
					}
					return Reflect.get(target, prop, receiver);
				},
			});
		}

		return this[Lists];
	}

	/**
	 * Don't use this. Convert any usage to `modelInstance.fetchLink({rel: '', mode: 'batch'})`
	 *
	 * @param {string} _url
	 * @param {object} params
	 * @param {object} options
	 * @param {any} parent
	 * @returns {Promise<Batch>}
	 * @protected
	 * @deprecated
	 */
	async getBatch(_url, params = {}, options, parent = this) {
		let { transform, method = 'get', data = null } = options || {};
		if (typeof options === 'function') {
			transform = options;
		}

		if (!/^(get|post|put|delete|head)$/.test(method)) {
			throw new Error('Invalid HTTP Method');
		}

		let raw = await this[method](url.appendQueryParams(_url, params), data);

		if (transform) {
			raw = await transform(raw);
		}

		const batch = new Batch(this, parent, raw);

		return batch.waitForPending();
	}

	/**
	 * Performs HTTP requests and attempts to collate them.
	 * Do not use directly outside of @nti/lib-interfaces. Public request api is on the model with 'fetchLink'
	 *
	 * @param {string} url
	 * @returns {Promise<any>}
	 * @protected
	 */
	get(url) {
		let key = typeof url === 'string' ? url : JSON.stringify(url);
		const inflight = (this.inflightRequests = this.inflightRequests || {});

		if (inflight[key]) {
			return inflight[key];
		}

		if (!url || url === '') {
			return Promise.reject(new Error('No URL'));
		}

		function clean() {
			delete inflight[key];
		}

		let p = (inflight[key] = this.getServer().get(url, this[Context]));

		wait.on(p) //once the request finishes
			// .then(()=>wait(1000)) //wait one second before
			.then(clean, clean); //we remove the request's promise from the in-flight cache.

		return p;
	}

	/**
	 * Performs HTTP HEAD requests
	 * Do not use directly outside of @nti/lib-interfaces. Public request api is on the model with 'fetchLink'
	 *
	 * @param {string} url
	 * @returns {Promise<any>}
	 * @protected
	 */
	head(url) {
		return this.get({ method: 'HEAD', url: url });
	}

	/**
	 * Performs HTTP POST requests
	 * Do not use directly outside of @nti/lib-interfaces. Public request api is on the model with 'fetchLink'
	 *
	 * @param {string} url
	 * @param {any} data
	 * @returns {Promise<any>}
	 * @protected
	 */
	post(url, data) {
		return this.getServer().post(url, data, this[Context]);
	}

	/**
	 * Performs HTTP PUT requests
	 * Do not use directly outside of @nti/lib-interfaces. Public request api is on the model with 'fetchLink'
	 *
	 * @param {string} url
	 * @param {any} data
	 * @returns {Promise<any>}
	 * @protected
	 */
	put(url, data) {
		return this.getServer().put(url, data, this[Context]);
	}

	/**
	 * Performs HTTP DELETE requests
	 * Do not use directly outside of @nti/lib-interfaces. Public request api is on the model with 'fetchLink'
	 *
	 * @param {string} url
	 * @param {any} data
	 * @returns {Promise<any>}
	 * @protected
	 */
	delete(url, data) {
		return this.getServer().delete(url, data, this[Context]);
	}

	async requestParseResponse(method, url, data, parent = this) {
		const x = await this[method](url, data);
		try {
			const model = parse(this, parent, x);
			await maybeWait(model);
			return model;
		} catch (e) {
			return x;
		}
	}

	/**
	 * Performs HTTP POST requests
	 * Do not use directly outside of @nti/lib-interfaces. Public request api is on the model with 'fetchLink'
	 *
	 * @param {string} url
	 * @param {any} data
	 * @param {Model} parent
	 * @returns {Promise<any>}
	 * @protected
	 * @deprecated
	 */
	postParseResponse = async (url, data, parent = this) =>
		this.requestParseResponse('post', url, data, parent);

	/**
	 * Performs HTTP PUT requests
	 * Do not use directly outside of @nti/lib-interfaces. Public request api is on the model with 'fetchLink'
	 *
	 * @param {string} url
	 * @param {any} data
	 * @param {Model} parent
	 * @returns {Promise<any>}
	 * @protected
	 * @deprecated
	 */
	putParseResponse = async (url, data, parent = this) =>
		this.requestParseResponse('put', url, data, parent);

	hasCookie(cookie) {
		let c = this[Context];
		let d = global.document;
		c = (c && c.headers) || d;
		c = c && (c.Cookie || c.cookie);
		c = (c && c.split(/;\W*/)) || [];

		const search = (found, v) => found || (v && v.indexOf(cookie) === 0);

		return c.reduce(search, false);
	}

	getEnrollment() {
		if (!this[ENROLLMENT]) {
			this[ENROLLMENT] = new Enrollment(this);
		}
		return this[ENROLLMENT];
	}

	getUserPreferences() {
		if (!this[USER_PREFERENCES]) {
			this[USER_PREFERENCES] = new UserPreferences(this);
		}
		return this[USER_PREFERENCES];
	}

	/**
	 * Get a PageInfo
	 *
	 * @param {string} ntiid - the page id.
	 * @param {Object} [options] - an object of additional options
	 * @param {Object} [options.parent] - the parent reference to assign the PageInfo
	 * @param {Object} [options.params] - params to add to the request url.
	 * @returns {Promise} resolves with a PageInfo
	 */
	async getPageInfo(ntiid, options) {
		const mime = 'application/vnd.nextthought.pageinfo+json';
		const { parent, params } = options || {};

		if (!isNTIID(ntiid)) {
			return Promise.reject(
				new Error(`Bad PageInfo NTIID: ${JSON.stringify(ntiid)}`)
			);
		}

		const subject = await this.getObject(ntiid, {
			params,
			parent: parent || this,
			type: mime,
		});

		if (!(subject instanceof PageInfo)) {
			throw new Error('Invalid PageInfo');
		}

		return subject;
	}

	async getObjectAtURL(url, ntiid) {
		return this.get(url).catch(this.buildGetObjectErrorHandler(ntiid));
	}

	async getObjectRaw(ntiid, field, type, params) {
		if (!isNTIID(ntiid)) {
			throw new Error(
				`Invalid Argument: Not an NTIID: ${JSON.stringify(ntiid)}`
			);
		}

		let _url = this.getObjectURL(ntiid, field);

		if (type || params) {
			const headers = {};
			const extras = {
				...(params || {}),
				...(type ? { type } : {}),
			};

			if (type) {
				headers.accept = type;
			}

			_url = url.appendQueryParams(_url, extras);
			_url = { url: _url, headers };
		}

		return this.getObjectAtURL(_url, ntiid);
	}

	async buildGetObjectErrorHandler(ntiid) {
		return o => {
			if (o.statusCode === 404 && 'MimeType' in o) {
				delete o.statusCode;
				delete o.Message;
				return { ...o };
			}

			if (o.statusCode === 403 && ntiid) {
				return this.getObjectRelatedContext(ntiid)
					.catch(() => null)
					.then(e => {
						if (e) {
							e.statusCode = 403;
						}

						return Promise.reject(e || o);
					});
			}

			return Promise.reject(o);
		};
	}

	async getObjectsRaw(ntiids) {
		if (!Array.isArray(ntiids)) {
			ntiids = [ntiids];
		}

		return Promise.all(ntiids.map(n => this.getObjectRaw(n))).then(
			results =>
				(!Array.isArray(results) ? [results] : results).map(o =>
					o && o.MimeType ? o : null
				)
		);
	}

	async getObjectRelatedContext(ntiid) {
		if (!isNTIID(ntiid)) {
			return Promise.reject(
				`Invalid Argument: Value is not an NTIID: ${JSON.stringify(
					ntiid
				)}`
			);
		}

		const url = this.getObjectRelatedContextURL(ntiid);

		return this.get(url)
			.catch(() => null)
			.then(o => {
				return !o?.Items?.length ? null : o;
			});
	}

	/**
	 * Get an Object
	 *
	 * @param {string|Object} ntiid - the object's id, or a raw JSO to parse into a Model.
	 * @param {Object} [options] - an object of additional options
	 * @param {string} [options.field] - field of the object to retrieve.
	 * @param {Model} [options.parent] - the parent reference to assign the returned Model
	 * @param {Object} [options.params] - params to add to the request url.
	 * @param {string} [options.type] - enforce an expected type.
	 * @returns {Promise} resolves with a Model instance of the object
	 */
	async getObject(ntiid, options) {
		const { field, params, parent, type } = options || {};

		const data =
			typeof ntiid === 'object'
				? ntiid
				: await this.getObjectRaw(ntiid, field, type, params);

		const model = parse(this, parent || this, data);

		await maybeWait(model);

		return model;
	}

	getObjectPlaceholder(obj) {
		return new AbstractPlaceholder(this, this, obj);
	}

	async getObjects(ntiids, parent) {
		const data = await this.getObjectsRaw(ntiids);
		const models = parse(this, parent || this, data);
		await maybeWait(models);
		return models;
	}

	async getPurchasables(ids) {
		let _url = '/dataserver2/store/get_purchasables';

		if (ids) {
			if (Array.isArray(ids)) {
				ids = ids.join(',');
			}

			_url = url.appendQueryParams(_url, { purchasables: ids });
		}

		const collection = parse(this, null, (await this.get(_url)).Items);
		await maybeWait(collection);
		return collection;
	}

	getAppUsername() {
		let { appUsername } = this;

		if (!appUsername) {
			let { Title } = this.getUserWorkspace() || {};
			appUsername = Title;
			Object.assign(this, { appUsername });
		}

		return appUsername;
	}

	async getAppUser() {
		if (this[AppUser]) {
			return this[AppUser];
		}

		// We don't want to allow multiple calls to getAppUser to trigger several requests,
		// so we need to collapse them into one. This will make a promise that we can resolve
		// when we have the user so that calls between the cached state above and the in-flight
		// state don't create duplicates
		const RE_ENTRY = 'Re-entry Guard for getAppUser()';
		if (this[RE_ENTRY]) {
			return this[RE_ENTRY];
		}

		let resolve, reject;
		const nonce = new Promise((a, b) => ((resolve = a), (reject = b)));
		// Prevent unhandled rejection warnings, because this promise very well
		// may not ever get a listener (especially if there is not a re-entry
		// before resolution). This adds a no-op handler to the nonce promise,
		// leaving the nonce reference to the original so that rejections still
		// propagate.
		nonce.catch(() => {});
		this[RE_ENTRY] = nonce;

		try {
			const url = this.getResolveAppUserURL();
			if (!url) {
				throw new Error('Not logged in');
			}

			const data = await this.get({ url });
			const user = await maybeWait(parse(this, this, data));

			this[AppUser] = user;

			// node will not have dispatchEvent nor CustomEvent defined globally.
			if (
				typeof dispatchEvent !== 'undefined' &&
				typeof CustomEvent !== 'undefined'
			) {
				dispatchEvent(new CustomEvent('user-set', { detail: user }));
			}

			resolve(user);
			return user;
		} catch (e) {
			reject(e);
			throw e;
		} finally {
			if (this[RE_ENTRY] === nonce) {
				delete this[RE_ENTRY];
			}
		}
	}

	/**
	 * Do not use this method for general purpose resolving the user,
	 * use the async method.
	 *
	 * @returns {User} A user model
	 */
	getAppUserSync() {
		return (
			this[AppUser] ||
			(() => {
				throw new Error('User is not resolved');
			})()
		);
	}

	async [RequestEntityResolve](entityId) {
		let key = `entity-${entityId}`;
		let cache = this.getDataCache();
		let cached = cache.get(key);
		let result;

		let entityMatcher = d =>
			d.NTIID === entityId || d.Username === entityId;

		if (cached) {
			result = Promise.resolve(cached);
		} else {
			result = (async () => {
				let entity;

				if (this.isAnonymous) {
					entity = {
						MimeType: User.MimeType,
						Username: entityId,
						shallow: true,
						alias: ' ',
						realname: ' ',
						// url-join(getConfig().server, 'users', entityId, '@@avatar')
						avatarURL: `/dataserver2/users/${encodeURIComponent(
							entityId
						)}/@@avatar`,
					};
				} else {
					const data = await this.get(
						this.getResolveUserURL(entityId)
					);
					const items = data.Items || (data.MimeType ? [data] : []);
					entity = items.find(entityMatcher);
				}

				if (!entity) {
					throw new Error(`Could not resolve entity: "${entityId}".`);
				}

				cache.set(key, entity);

				return entity;
			})();

			cache.setVolatile(key, result); //if this is asked for again before we resolve, reuse this promise.
			result.catch(() => cache.setVolatile(key, null));
		}

		const user = parse(this[Service], this, await result);
		await maybeWait(user);
		return user;
	}

	/**
	 * Resolve an entity.
	 *
	 * @param {string} entityId ID to resolve to entity.
	 * @returns {Promise} Promise for an Entity.
	 */
	async resolveEntity(entityId) {
		const key = 'entity-respository';
		const cache = this.getDataCache();
		const repo = cache.get(key) || {};
		cache.setVolatile(key, repo);

		if (repo[entityId]) {
			return Promise.resolve(repo[entityId]);
		}

		let req = (repo[entityId] = this[RequestEntityResolve](entityId));

		req.then(
			entity => (repo[entityId] = entity),
			() => delete repo[entityId]
		);

		return req;
	}

	entityInCache(entityId) {
		const key = 'entity-respository';
		const cache = this.getDataCache();
		const repo = cache.get(key) || {};
		return entityId in repo;
	}

	async getMetadataFor(uri) {
		const requestURI = this.getMetadataExtractorURL(uri);
		const data = parse(this, null, await this.get(requestURI));
		await maybeWait(data);
		return data;
	}

	/**
	 * @returns {Workspace}
	 */
	getUserWorkspace() {
		return (this.Items || []).find(x => x.hasLink('ResolveSelf'));
	}

	/**
	 * @param {string} name
	 * @returns {Workspace}
	 */
	getWorkspace(name) {
		return (this.Items || []).find(x => x.Title === name);
	}

	/**
	 *
	 * @param {string} title
	 * @param {string=} workspaceName
	 * @returns {WorkspaceCollection}
	 */
	getCollection(title, workspaceName) {
		const workspace = workspaceName
			? this.getWorkspace(workspaceName)
			: this.getUserWorkspace();

		const items = workspace?.Items || [];

		return items.find(o => o.Title === title);
	}

	/**
	 *
	 * @param {string} mimeType The mimetype of what we're looking for
	 * @param {string=} title Optionally, restrict by title
	 * @param {Model[]=} tryScopes Optionally, pick a destination from contextual scopes. Treat as a stack!
	 * @returns {WorkspaceCollection|Link} the collection
	 */
	getCollectionFor(mimeType, title, tryScopes) {
		/** @type {Workspace[]} */
		let items = this.Items || [];
		/**
		 * @param {Link} x
		 * @returns {boolean}
		 */
		let Pages = x => x?.rel === 'Pages';

		if (mimeType && typeof mimeType !== 'string') {
			mimeType = mimeType.MimeType;
		}

		//tryScopes is treated as a stack, so the top of the stack is at the end of the
		//array...for iterating, reverse the array.
		tryScopes = (tryScopes || []).slice().reverse();

		for (let scope of tryScopes) {
			let link = (scope?.Links || []).find(Pages);
			if (link /*&& link.accepts(mimeType)*/) {
				return link;
			}
		}

		for (let workspace of items) {
			for (let collection of workspace.Items || []) {
				if (collection.acceptsType(mimeType)) {
					if (!title || collection.Title === title) {
						return collection;
					}
				}
			}
		}

		return void 0;
	}

	getLogoutURL(successURL) {
		let _url = getLink(this.#pong, 'logon.logout');
		if (!_url) {
			logger.error(
				'No Logout URL defined! Pulling a URL out of thin air.'
			);
			_url = '/dataserver2/logon.logout';
		}

		return url.appendQueryParams(_url, { success: successURL });
	}

	/**
	 * @protected
	 * @param {string} ntiid
	 * @param {string} postfix
	 * @returns {string}
	 */
	getContainerURL(ntiid, postfix) {
		let base = this.getResolveAppUserURL();
		let pageURI = encodeURIComponent(`Pages(${ntiid})`);

		return url.join(base, pageURI, postfix || '');
	}

	/**
	 * @deprecated
	 * @param {string} name
	 * @returns {string}
	 */
	getContentPackagesURL(name) {
		return (this.getCollection(name || 'Main', 'Library') || {}).href;
	}

	/**
	 * @deprecated
	 * @returns {string}
	 */
	getContentBundlesURL() {
		return (
			this.getCollection('VisibleContentBundles', 'ContentBundles') || {}
		).href;
	}

	/**
	 * @param {Record<string,string>} params
	 * @returns {Promise<Batch>}
	 */
	async getContentBundles(params) {
		return this.getCollection(
			'VisibleContentBundles',
			'ContentBundles'
		)?.fetchLink({
			rel: 'self',
			mode: 'batch',
			params,
		});
	}

	/**
	 * @deprecated
	 * @returns {string}
	 */
	getCoursesEnrolledURL() {
		return (this.getCollection('EnrolledCourses', 'Courses') || {}).href;
	}

	/**
	 * @deprecated
	 * @returns {string}
	 */
	getCoursesAdministeringURL() {
		return (this.getCollection('AdministeredCourses', 'Courses') || {})
			.href;
	}

	/**
	 * @deprecated
	 * @returns {string}
	 */
	getCoursesCatalogURL() {
		return (this.getCollection('AllCourses', 'Courses') || {}).href;
	}

	getObjectURL(ntiid, field) {
		if (!ntiid) {
			throw new Error('No NTIID specified');
		}

		const parts = isHrefId(ntiid)
			? [decodeHrefFrom(ntiid)]
			: [
					(this.getCollection('Objects', 'Global') || {}).href,
					encodeURIComponent(ntiid || ''),
			  ];

		if (field) {
			parts.push('++fields++' + field);
		}

		return parts.join('/');
	}

	getObjectRelatedContextURL(ntiid) {
		return [this.getObjectURL(ntiid), '@@forbidden_related_context'].join(
			'/'
		);
	}

	getUserSearchURL(username) {
		let l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_USER_SEARCH
		);

		if (!l || !username || username === '') {
			return null;
		}

		return url.join(l, username && encodeURIComponent(username));
	}

	getUserUnifiedSearchURL() {
		let l = getLink(
			(this.getUserWorkspace() || {}).Links || [],
			REL_USER_UNIFIED_SEARCH
		);

		return l || null;
	}

	getResolveAppUserURL() {
		return getLink(this.getUserWorkspace(), 'ResolveSelf');
	}

	getResolveUserURL(username) {
		if (isNTIID(username)) {
			return this.getObjectURL(username);
		}

		let l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_USER_RESOLVE
		);

		if (!l) {
			return null;
		}

		return url.join(l, username && encodeURIComponent(username));
	}

	getBulkResolveUserURL() {
		let l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_BULK_USER_RESOLVE
		);

		return l || null;
	}

	getMetadataExtractorURL(uri) {
		const base = '/dataserver2/URLMetaDataExtractor';
		return uri ? url.appendQueryParams(base, { url: uri }) : base;
	}

	getPurchasableItemURL() {
		return '/dataserver2/store/get_purchasables'; //TODO: this is legacy...replace
	}

	getStoreActivationURL() {
		return '/dataserver2/store/redeem_purchase_code'; //TODO: this is legacy...replace
	}

	getSupportLinks() {
		//userObject.getLink('content.permanent_general_privacy_page')
		const link = x => getLink(this.#pong, x);
		const ensureProtocol = x =>
			!x || /^(mailto|https?):/i.test(x) ? x : `mailto:${x}`;
		return {
			about: link('content.about-site') || 'http://nextthought.com',

			privacyPolicy:
				link('privacy-policy') || //placeholder "future override"
				link('content.permanent_general_privacy_page') ||
				link('content.direct_privacy_link'),

			termsOfService:
				link('terms-of-service') || //placeholder "future override"
				link('content.permanent_tos_page') ||
				link('content.direct_tos_link'),

			help: link('content.help-site') || 'https://help.nextthought.com',

			support: ensureProtocol(
				link('content.support-site') || link('support-email')
			),
			supportContact: link('support-email') || 'support@nextthought.com',

			get internalSupport() {
				return /(mailto:)?support@nextthought\.com$/.test(
					this.supportContact
				);
			},
		};
	}

	/**
	 * @param  {string|Object} thing The NTIID or model to retrieve a LibraryPath for.
	 * @returns {Promise} Resolves with library path
	 */
	async getContextPathFor(thing) {
		const cache = LibraryPathCache;
		let _url = thing.getLink && thing.getLink('LibraryPath');

		if (!_url) {
			const id = (thing && thing.getID && thing.getID()) || thing;
			if (typeof id !== 'string') {
				throw new Error(
					'Invalid Argument! Must be an id, or an object that implements getID()'
				);
			}

			const { href } = this.getCollection('LibraryPath', 'Global') || {};
			if (!href) {
				throw Object.assign(
					new Error('PathToContainerId is not available here.'),
					{ statusCode: NOT_IMPLEMENTED }
				);
			}

			_url = url.appendQueryParams(href, { objectId: id });
		}

		const fetch = async () => {
			const parent = typeof thing === 'object' ? thing : this;
			const data = await this.get(_url);
			// data will be an array of arrays of models.
			// So:
			// 		[
			// 			[course, outline, etc...], // <- a path to thing
			// 			[...] // <- another path to thing
			// 		]
			return Promise.all(
				data.map(p =>
					maybeWait(p.map(item => parse(this, parent, item)))
				)
			);
		};

		let promise = cache.get(_url);

		if (!promise) {
			cache.set(_url, (promise = fetch()));
		}

		return promise;
	}
}
