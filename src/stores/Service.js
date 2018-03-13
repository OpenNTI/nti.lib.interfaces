import EventEmitter from 'events';

import Logger from 'nti-util-logger';
import {mixin} from 'nti-lib-decorators';
import {isNTIID} from 'nti-lib-ntiids';
import {URL, wait} from 'nti-commons';

import {parse} from '../models/Parser';
import Capabilities from '../models/Capabilities';
import AbstractPlaceholder from '../models/AbstractPlaceholder';
import Batch from '../data-sources/data-types/Batch';
import {Mixin as Pendability, attach as attachPendingQueue} from '../mixins/Pendability';
import {Mixin as InstanceCacheContainer} from '../mixins/InstanceCacheContainer';
import DataCache from '../utils/datacache';
import getLink from '../utils/getlink';
import maybeWait from '../utils/maybe-wait';
import {
	REL_USER_SEARCH,
	REL_USER_UNIFIED_SEARCH,
	REL_USER_RESOLVE,
	REL_BULK_USER_RESOLVE,
	NO_LINK,
	Context,
	Server,
	Service,
	SiteName
} from '../constants';

import ContactsStore from './Contacts';
import CommunitiesStore from './EntityStore';
import GroupsStore from './Groups';
import Enrollment from './Enrollment';

const ENROLLMENT = Symbol('enrollment');

const NOT_IMPLEMENTED = 501; //HTTP 501 means not implemented

const LOGOUT_URL = '%%logout-url%%';

const AppUser = Symbol('LoggedInUser');
const Contacts = Symbol('Contacts');
const Communities = Symbol('Communities');
const Groups = Symbol('Groups');
const Lists = Symbol('Lists');
const RequestEntityResolve = Symbol('RequestEntityResolve');

const logger = Logger.get('Service');

function hideCurrentProperties (o) {
	for (let key of Object.keys(o)) {
		const desc = Object.getOwnPropertyDescriptor(o, key);
		if (desc) {
			desc.enumerable = false;
			delete o[key];
			Object.defineProperty(o, key, desc);
		}
	}
}

export default
@mixin(Pendability, InstanceCacheContainer)
class ServiceDocument extends EventEmitter {

	constructor (json, server, context) {
		super();

		this.setMaxListeners(100);
		//Make EventEmitter properties non-enumerable
		hideCurrentProperties(this);

		this.isService = Service;
		this[Service] = this; //So the parser can access it
		this[Server] = server;
		this[Context] = context;

		if (this.initMixins) {
			this.initMixins(json);
		}

		this.assignData(json, {silent: true});
	}


	toJSON () {
		const {capabilities, ...data} = this;
		return {
			...data,
			CapabilityList: capabilities,
		};
	}


	assignData (json, {silent = false} = {}) {
		const {[Context]: context, [Server]: server} = this;
		const {CapabilityList: caps = [], ...data} = json;
		Object.assign(this, data, {appUsername: null});

		this.capabilities = new Capabilities(this, caps);

		if (!this.getAppUsername()) {
			delete this[AppUser];
			delete this[Contacts];
		}
		else {
			this.addToPending(
				this.getAppUser().then(u => {
					this[AppUser] = u;

					//Not all apps that use this library are a Platform App... for those apps that do not need contacts,
					//skip loading them.
					if (server.config.SKIP_FRIENDSLISTS) {
						logger.log('Skipping/Ignoring FriendsLists');
						return;
					}

					let {href} = this.getCollection('FriendsLists', this.getAppUsername()) || {};
					if (href) {
						this[Contacts] = new ContactsStore(this, href, u);
						return this[Contacts].waitForPending();
					} else {
						logger.warn('No FriendsLists Collection');
					}
				},
				e => logger.log(e.stack || e.message || e))
			);
		}

		if (context) {
			attachPendingQueue(context).addToPending(this.waitForPending());
		}

		if (!silent) {
			this.waitForPending()
				.then(() => this.emit('change', this));
		}

		return this;
	}


	getSiteName () {
		return this[Server].config.siteName || (this[Context] || {})[SiteName];
	}


	getServer () {
		return this[Server];
	}


	getDataCache () {
		return DataCache.getForContext(this[Context]);
	}


	getContacts () {
		return this[Contacts];
	}


	getCommunities () {
		if (!this[Communities]) {
			let u = this[AppUser];
			let {href} = this.getCollection('Communities', this.getAppUsername()) || {};
			if (href) {
				this[Communities] = new CommunitiesStore(this, href, u);
			} else {
				logger.warn('No Communities Collection');
			}
		}

		return this[Communities];
	}


	getGroups () {
		if (!this[Groups]) {
			let u = this[AppUser];
			let {href} = this.getCollection('Groups', this.getAppUsername()) || {};
			if (href) {
				this[Groups] = new GroupsStore(this, href, u);
			} else {
				logger.warn('No Groups Collection');
			}
		}

		return this[Groups];
	}


	getLists () {
		const contacts = this[Contacts];
		if (!this[Lists] && contacts) {

			this[Lists] = Object.create(contacts, {
				[Symbol.iterator]: {
					value: function () {
						const snapshot = this.getLists();
						const {length} = snapshot;
						let index = 0;
						return {

							next () {
								const done = index >= length;
								const value = snapshot[index++];

								return { value, done };
							}

						};
					}
				}
			});
		}

		return this[Lists];
	}


	get (url) {
		let key = typeof url === 'string' ? url : JSON.stringify(url);
		const inflight = this.inflightRequests = (this.inflightRequests || {});

		if (inflight[key]) {
			return inflight[key];
		}

		if (!url || url === '') {
			return Promise.reject('No URL');
		}

		function clean () {
			delete inflight[key];
		}

		let p = inflight[key] = this.getServer().get(url, this[Context]);

		wait.on(p) //once the request finishes
			// .then(()=>wait(1000)) //wait one second before
			.then(clean, clean); //we remove the request's promise from the in-flight cache.

		return p;
	}


	getBatch (url, params = {}, transform, parent = this) {
		return this.get(URL.appendQueryParams(url, params))
			.then(raw => transform ? transform(raw) : raw)
			.then(raw => new Batch(this, parent, raw))
			.then(batch => batch.waitForPending());
	}


	head (url) {
		return this.get({method: 'HEAD', url: url});
	}


	post (url, data) {
		return this.getServer().post(url, data, this[Context]);
	}


	put (url, data) {
		return this.getServer().put(url, data, this[Context]);
	}


	delete (url, data) {
		return this.getServer().delete(url, data, this[Context]);
	}


	postParseResponse (url, data, parent = this) {
		return this.post(url, data)
			.then(x => {
				try {
					return parse(this, parent, x);
				} catch (e) {
					return x;
				}
			});
	}


	putParseResponse (url, data, parent = this) {
		return this.put(url, data)
			.then(x => {
				try {
					return parse(this, parent, x);
				} catch (e) {
					return x;
				}
			});
	}


	hasCookie (cookie) {
		let c = this[Context];
		let d = global.document;
		c = (c && c.headers) || d;
		c = c && (c.Cookie || c.cookie);
		c = (c && c.split(/;\W*/)) || [];

		function search (found, v) {
			return found || (v && v.indexOf(cookie) === 0);
		}

		return c.reduce(search, false);
	}


	getEnrollment () {
		if (!this[ENROLLMENT]) {
			logger.warn('TODO: Move the guts of store/Enrollent into the app as API.');
			this[ENROLLMENT] = new Enrollment(this);
		}
		return this[ENROLLMENT];
	}


	/**
	 * Get a PageInfo
	 *
	 * @param {string} ntiid - the page id.
	 * @param {object} [options] - an object of additional options
	 * @param {object} [options.parent] - the parent reference to assign the PageInfo
	 * @param {object} [options.params] - params to add to the request url.
	 * @return {Promise} resolves with a PageInfo
	 */
	getPageInfo (ntiid, options) {
		const mime = 'application/vnd.nextthought.pageinfo+json';
		const {parent, params} = options || {};

		if (!isNTIID(ntiid)) {
			return Promise.reject('Bad NTIID');
		}

		return this.getObject(ntiid, {
			params,
			parent: parent || this,
			type: mime
		});
	}


	getObjectAtURL (url, ntiid) {
		return this.get(url)
			.catch(this.buildGetObjectErrorHandler(ntiid));
	}


	getObjectRaw (ntiid, field, type, params) {
		if (!isNTIID(ntiid)) {
			return Promise.reject('Bad NTIID');
		}


		let url = this.getObjectURL(ntiid, field);

		if (type || params) {
			const headers = {};
			const extras = {
				...(params || {}),
				...(type ? {type} : {})
			};

			if (type) {
				headers.accept = type;
			}

			url = URL.appendQueryParams(url, extras);
			url = {url, headers};
		}

		return this.getObjectAtURL(url, ntiid);
	}


	buildGetObjectErrorHandler (ntiid) {
		return o => {
			if (o.statusCode === 404 && 'MimeType' in o) {
				delete o.statusCode;
				delete o.Message;
				return {...o};
			}

			if (o.statusCode === 403 && ntiid) {
				return this.getObjectRelatedContext(ntiid)
					.catch(()=> null)
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


	getObjectsRaw (ntiids) {
		if (!Array.isArray(ntiids)) {
			ntiids = [ntiids];
		}

		return Promise.all(ntiids.map(n => this.getObjectRaw(n)))
			.then(results =>
				(!Array.isArray(results) ? [results] : results)
					.map(o => o && o.MimeType ? o : null));
	}


	getObjectRelatedContext (ntiid) {
		if (!isNTIID(ntiid)) {
			return Promise.reject('Bad NTIID');
		}

		const url = this.getObjectRelatedContextURL(ntiid);

		return this.get(url)
			.catch(() => null)
			.then(o => {

				// if (o && o.Items) {
				// 	o.Items = parse(this, this, o.Items);
				// }

				return (!o || !o.Items || !o.Items.length) ? null : o;
			});
	}


	/**
	 * Get an Object
	 *
	 * @param {string|object} ntiid - the object's id, or a raw JSO to parse into a Model.
	 * @param {object} [options] - an object of additional options
	 * @param {string} [options.field] - field of the object to retrieve.
	 * @param {Model} [options.parent] - the parent reference to assign the returned Model
	 * @param {object} [options.params] - params to add to the request url.
	 * @param {string} [options.type] - enforce an expected type.
	 * @return {Promise} resolves with a Model instance of the object
	 */
	getObject (ntiid, options) {
		const {field, params, parent, type} = options || {};

		const resolve = (typeof ntiid === 'object')
			? Promise.resolve(ntiid)
			: this.getObjectRaw(ntiid, field, type, params);

		return resolve
			.then(o => parse(this, parent || this, o))
			.then(model => Array.isArray(model)
				? Promise.all(model.map(m => (m && m.waitForPending) ? m.waitForPending() : m))
				: (model && model.waitForPending)
					? model.waitForPending()
					: model
			);
	}


	getObjectPlaceholder (obj) {
		return new AbstractPlaceholder(this, this, obj);
	}


	getObjects (ntiids, parent) {
		return this.getObjectsRaw(ntiids).then(o => parse(this, parent || this, o));
	}


	getPurchasables (ids) {
		let url = '/dataserver2/store/get_purchasables';

		if (ids) {
			if (Array.isArray(ids)) {
				ids = ids.join(',');
			}

			url = URL.appendQueryParams(url, {purchasables: ids});
		}

		return this.get(url)
			.then(collection=> parse(this, null, collection.Items));
	}


	getAppUsername () {
		let {appUsername} = this;

		if (!appUsername) {
			let {Title} = this.getUserWorkspace() || {};
			appUsername = Title;
			Object.assign(this, {appUsername});
		}

		return appUsername;
	}


	getAppUser () {
		if (this[AppUser]) {
			return Promise.resolve(this[AppUser]);
		}

		const inflate = data => parse(this, this, data);
		const url = this.getResolveAppUserURL();

		return url
			? this.get({url}).then(inflate)
			: Promise.reject('Not logged in');
	}


	/**
	 * Do not use this method for general purpose resolving the user,
	 * use the async method.
	 * @returns {User} A user model
	 */
	getAppUserSync () {
		return this[AppUser] ||
			(()=> { throw new Error('User is not resolved'); })();
	}


	[RequestEntityResolve] (entityId) {
		let key = `entity-${entityId}`;
		let cache = this.getDataCache();
		let cached = cache.get(key);
		let result;

		let entityMatcher = d => d.NTIID === entityId || d.Username === entityId;

		if (cached) {
			result = Promise.resolve(cached);
		}
		else {
			result = this.get(this.getResolveUserURL(entityId))
				.then(data => {
					let items = data.Items || (data.MimeType ? [data] : []);
					let entity = items.find(entityMatcher);

					if (entity) {
						cache.set(key, entity);
					}

					return entity || Promise.reject(`Could not resolve entity: "${entityId}".`);
				});

			cache.setVolatile(key, result);//if this is asked for again before we resolve, reuse this promise.
			result.catch(() => cache.setVolatile(key, null));
		}

		return result.then(user => parse(this[Service], this, user));
	}


	/**
	 * Resolve an entity.
	 *
	 * @param {string} entityId ID to resolve to entity.
	 *
	 * @return {Promise} Promise for an Entity.
	 */
	resolveEntity (entityId) {
		const key = 'entity-respository';
		const cache = this.getDataCache();
		const repo = cache.get(key) || {};
		cache.setVolatile(key, repo);

		if (repo[entityId]) {
			return Promise.resolve(repo[entityId]);
		}

		let req = repo[entityId] = this[RequestEntityResolve](entityId);

		req.then(
			entity => repo[entityId] = entity,
			()=> delete repo[entityId]);

		return req;
	}


	entityInCache (entityId) {
		const key = 'entity-respository';
		const cache = this.getDataCache();
		const repo = cache.get(key) || {};
		return entityId in repo;
	}


	getMetadataFor (uri) {
		const requestURI = this.getMetadataExtractorURL(uri);
		return this.get(requestURI)
			.then(x => parse(this, null, x));
	}


	getUserWorkspace () {
		for (let workspace of this.Items) {
			if (getLink(workspace, 'ResolveSelf')) {
				return workspace;
			}
		}
	}


	getWorkspace (name) {
		for(let workspace of this.Items) {
			if (workspace.Title === name) {
				if (!workspace.getLink) {
					Object.defineProperty(workspace, 'getLink', {
						value: (rel) => getLink(workspace, rel),
						enumerable: false
					});
				}
				if (!workspace.fetchLink) {
					Object.defineProperty(workspace, 'fetchLink', {
						value: (rel) => {
							const link = getLink(workspace, rel);
							if (!link) {
								return Promise.reject(NO_LINK);
							}
							return this.get(link);
						},
						enumerable: false
					});
				}
				return workspace;
			}
		}
	}


	getCollection (title, workspaceName) {
		let workspace = workspaceName ?
				this.getWorkspace(workspaceName) :
				this.getUserWorkspace(),
			items = (workspace && workspace.Items) || [];

		for (let o of items) {
			if (o.Title === title) {
				return o;
			}
		}
	}


	/**
	 *
	 * @param {string} mimeType The mimetype of what we're looking for
	 * @param {string} [title] Optionally, restrict by title
	 * @param {array} [tryScopes] Optionally, pick a destination from contextual scopes. Treat as a stack!
	 * @returns {object} the collection
	 */
	getCollectionFor (mimeType, title, tryScopes) {
		let items = this.Items || [];
		let Pages = x => x && x.rel === 'Pages';

		if (mimeType && typeof mimeType !== 'string') {
			mimeType = mimeType.MimeType;
		}

		//tryScopes is treated as a stack, so the top of the stack is at the end of the
		//array...for iterating, reverse the array.
		tryScopes = (tryScopes || []).slice().reverse();

		for(let scope of tryScopes) {
			let link = ((scope || {}).Links || []).find(Pages);
			if (link /*&& link.accepts(mimeType)*/) {
				return link;
			}
		}

		for (let workspace of items) {
			for(let collection of (workspace.Items || [])) {

				//TODO: make the Collection an official model and turn accepts into a method that returns boolean.
				//if (collection.accepts(mimeType)) {
				if (collection && collection.accepts.indexOf(mimeType) > -1) {

					if (!title || collection.Title === title) {
						return collection;
					}

				}
			}
		}

		return void 0;
	}


	getLogoutURL (succssURL) {
		let url = this.getDataCache().get(LOGOUT_URL);
		if (!url) {
			logger.error('No Logout URL defined! Pulling a URL out of thin air.');
			url = '/dataserver2/logon.logout';
		}

		return URL.appendQueryParams(url, {success: succssURL});
	}


	setLogoutURL (url) {
		if (!this[Context]) {
			throw new Error('Client cannot set url');
		}

		this.getDataCache().set(LOGOUT_URL, url);
	}


	getContainerURL (ntiid, postfix) {
		let base = this.getResolveAppUserURL();
		let pageURI = encodeURIComponent(`Pages(${ntiid})`);

		return URL.join(base, pageURI, postfix || '');
	}


	getContentPackagesURL (name) {
		return (this.getCollection(name || 'Main', 'Library') || {}).href;
	}


	getContentBundlesURL () {
		return (this.getCollection('VisibleContentBundles', 'ContentBundles') || {}).href;
	}


	getCoursesEnrolledURL () {
		return (this.getCollection('EnrolledCourses', 'Courses') || {}).href;
	}


	getCoursesAdministeringURL () {
		return (this.getCollection('AdministeredCourses', 'Courses') || {}).href;
	}


	getCoursesCatalogURL () {
		return (this.getCollection('AllCourses', 'Courses') || {}).href;
	}


	getObjectURL (ntiid, field) {
		if (!ntiid) {
			throw new Error('No NTIID specified');
		}

		let collection = this.getCollection('Objects', 'Global') || {};
		let parts = [
			collection.href || '',
			encodeURIComponent(ntiid || '')
		];
		if (field) {
			parts.push('++fields++' + field);
		}

		return parts.join('/');
	}


	getObjectRelatedContextURL (ntiid) {
		return [this.getObjectURL(ntiid), '@@forbidden_related_context'].join('/');
	}


	getUserSearchURL (username) {
		let l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_USER_SEARCH);

		if (!l || !username || username === '') {
			return null;
		}

		return URL.join(l, username && encodeURIComponent(username));
	}


	getUserUnifiedSearchURL () {
		let l = getLink(
			(this.getUserWorkspace() || {}).Links || [],
			REL_USER_UNIFIED_SEARCH);

		return l || null;
	}


	getResolveAppUserURL () {
		return getLink(this.getUserWorkspace(), 'ResolveSelf');
	}


	getResolveUserURL (username) {
		if (isNTIID(username)) {
			return this.getObjectURL(username);
		}

		let l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_USER_RESOLVE);

		if (!l) {
			return null;
		}

		return URL.join(l, username && encodeURIComponent(username));
	}


	getBulkResolveUserURL () {
		let l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_BULK_USER_RESOLVE);

		return l || null;
	}


	getMetadataExtractorURL (uri) {
		const base = '/dataserver2/URLMetaDataExtractor';
		return uri
			? URL.appendQueryParams(base, {url: uri})
			: base;
	}


	getPurchasableItemURL () {
		return '/dataserver2/store/get_purchasables';//TODO: this is legacy...replace
	}


	getStoreActivationURL () {
		return '/dataserver2/store/redeem_purchase_code';//TODO: this is legacy...replace
	}


	async getContextPathFor (ntiid) {
		let {href} = this.getCollection('LibraryPath', 'Global') || {};

		if (!href) {
			return Promise.reject({statusCode: NOT_IMPLEMENTED, message: 'PathToContainerId is not available here.'});
		}

		const data = await this.get(URL.appendQueryParams(href, {objectId: ntiid}));

		return Promise.all(data.map(p => p.map(item => maybeWait(parse(this, this, item)))));
	}
}
