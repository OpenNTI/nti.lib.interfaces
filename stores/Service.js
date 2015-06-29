import QueryString from 'query-string';

import {parse} from '../models';

import Capabilities from '../models/Capabilities';

import Enrollment from './Enrollment';
import Forums from './Forums';

import DataCache from '../utils/datacache';

import {REL_USER_SEARCH, REL_USER_UNIFIED_SEARCH, REL_USER_RESOLVE, REL_BULK_USER_RESOLVE} from '../constants';
import getLink from '../utils/getlink';
import joinWithURL from '../utils/urljoin';
import {isNTIID} from '../utils/ntiids';

let inflight = {};

import {Context, Server, Service, Pending} from '../CommonSymbols';

const NOT_IMPLEMENTED = 501; //HTTP 501 means not implemented

const AppUser = Symbol('LoggedInUser');
const RequestUserResolve = Symbol('RequestUserResolve');

export default class ServiceDocument {
	constructor (json, server, context) {
		this[Service] = this; //So the parser can access it
		this[Server] = server;
		this[Context] = context;

		let caps = json.CapabilityList || [];

		Object.assign(this, json);

		this.capabilities = new Capabilities(this, caps);
		this.enrollment = new Enrollment(this);
		this.forums = new Forums(this);

		this[Pending] = [
			this.getAppUser().then(u =>
				this[AppUser] = u
			)
		];
	}


	getServer () {
		return this[Server];
	}


	getDataCache () {
		return DataCache.getForContext(this[Context]);
	}


	get (url) {
		let key = typeof url === 'string' ? url : JSON.stringify(url);

		if (inflight[key]) {
			return inflight[key];
		}

		if (!url || url === '') {
			return Promise.reject('No URL');
		}

		function clean() {
			delete inflight[key];
		}

		let p = inflight[key] = this.getServer().get(url, this[Context]);

		p.then(clean, clean);

		return p;
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


	hasCookie (cookie) {
		let c = this[Context];
		let d = global.document;
		c = (c && c.headers) || d;
		c = c && (c.Cookie || c.cookie);
		c = (c && c.split(/;\W*/)) || [];

		function search(found, v) {
			return found || (v && v.indexOf(cookie) === 0);
		}

		return c.reduce(search, false);
	}


	getEnrollment () {
		return this.enrollment;
	}


	getPageInfo (ntiid) {
		let key = 'pageinfo-' + ntiid;
		let cache = this.getDataCache();
		let cached = cache.get(key);
		let result;

		if (cached) {
			result = Promise.resolve(cached);
		} else {
			result = this.getServer().getPageInfo(ntiid, this[Context])
				.then(function(json) {
					cache.set(key, json);
					return json;
				});
		}

		return result.then(info=>parse(this, this, info));
	}


	getObjects (ntiids) {
		return this.getServer().getObjects(ntiids, this[Context]);
	}


	getObject (ntiid, mime) {
		return this.getServer().getObject(ntiid, mime, this[Context]);
	}


	getParsedObject(ntiid, parent) {
		let p = o => parse(this, parent || this, o);

		if (typeof ntiid === 'object') {
			return Promise.resolve(p(ntiid));
		}

		return this.getObject(ntiid).then(p);
	}


	getParsedObjects(ntiids, parent) {
		return this.getObjects(ntiids).then(o => parse(this, parent || this, o));
	}


	getPurchasables (ids) {
		let url = '/dataserver2/store/get_purchasables';

		if (ids) {
			if (Array.isArray(ids)) {
				ids = ids.join(',');
			}

			url += '?' + QueryString.stringify({purchasables: ids});
		}

		return this.get(url)
			.then(collection=> parse(this, null, collection.Items));
	}


	getAppUsername () {
		let w = this.getUserWorkspace();
		return w && w.Title;
	}


	getAppUser () {
		let key = 'appuser';
		let cache = this.getDataCache();
		let cached = cache.get(key);
		let result;
		let url;

		if (cached) {
			result = Promise.resolve(cached);
		}
		else {
			url = this.getResolveAppUserURL();
			if (url) {
				result = this.get(url)
					.then(function(json) {
						cache.set(key, json);
						return json;
					});

				cache.setVolatile(key, result);//if this is asked for again before we resolve, reuse this promise.

			} else {
				result = Promise.resolve(null);
			}
		}

		return result.then(user=>parse(this[Service], this, user));
	}


	/**
	 * Do not use this method for general purpose resolving the user,
	 * use the async method.
	 * @returns {User} A user model
	 */
	getAppUserSync () {
		return this[AppUser] ||
			(()=> { throw new Error('User is not resolved'); }());
	}


	[RequestUserResolve] (username) {
		let key = `user-${username}`;
		let cache = this.getDataCache();
		let cached = cache.get(key);
		let result;

		if (cached) {
			result = Promise.resolve(cached);
		}
		else {
			result = this.get(this.getResolveUserURL(username))
				.then(data => {
					let items = data.Items || (data.MimeType ? [data] : []);
					let user = items.reduce((u, d) => u || (d.Username === username && d), null);

					cache.set(key, user);
					return user || Promise.reject(`Username "${username}" could not resolve.`);
				});

			cache.setVolatile(key, result);//if this is asked for again before we resolve, reuse this promise.
		}

		return result.then(user => parse(this[Service], this, user));
	}


	resolveUser (username) {
		let key = 'user-respository';
		let cache = this.getDataCache();
		let repo = cache.get(key) || {};
		cache.setVolatile(key, repo);

		if (repo[username]) {
			return Promise.resolve(repo[username]);
		}

		let req = repo[username] = this[RequestUserResolve](username);

		req.then(
			user=> repo[username] = user,
			()=> delete repo[username]);

		return req;
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


	ensureAnalyticsSession () {
		let workspace = this.getWorkspace('Analytics');
		let url = getLink(workspace, 'analytics_session');

		return this.hasCookie('nti.da_session') ? Promise.resolve() : this.post(url);
	}


	endAnalyticsSession () {
		let workspace = this.getWorkspace('Analytics');
		let url = getLink(workspace, 'end_analytics_session');
		let timestamp = Math.floor(new Date() / 1000);
		return url ? this.post(url, { timestamp }) : Promise.reject('No link for end_analytics_session.');
	}


	postAnalytics (events) {
		let workspace = this.getWorkspace('Analytics');
		let url = getLink(workspace, 'batch_events');
		let payload = {
			MimeType: 'application/vnd.nextthought.analytics.batchevents',
			events: events
		};

		if (!url) {
			return Promise.reject({
				statusCode: NOT_IMPLEMENTED,
				message: 'No Analytics End-point.'
			});
		}

		return this.ensureAnalyticsSession()
				.then(this.post.bind(this, url, payload));
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
				if (collection.accepts.indexOf(mimeType) > -1) {

					if (!title || collection.Title === title) {
						return collection;
					}

				}
			}
		}

		return void 0;
	}


	getContainerURL (ntiid, postfix) {
		let base = this.getResolveAppUserURL();
		let pageURI = encodeURIComponent(`Pages(${ntiid})`);

		return joinWithURL(base, pageURI, postfix || '');
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


	getUserSearchURL (username) {
		let l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_USER_SEARCH);

		if (!l) {
			return null;
		}

		return joinWithURL(l, username && encodeURIComponent(username));
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

		return joinWithURL(l, username && encodeURIComponent(username));
	}


	getBulkResolveUserURL () {
		let l = getLink(
			(this.getWorkspace('Global') || {}).Links || [],
			REL_BULK_USER_RESOLVE);

		return l || null;
	}


	getPurchasableItemURL () {
		return '/dataserver2/store/get_purchasables';//TODO: this is legacy...replace
	}


	getStoreActivationURL () {
		return '/dataserver2/store/redeem_purchase_code';//TODO: this is legacy...replace
	}

}
