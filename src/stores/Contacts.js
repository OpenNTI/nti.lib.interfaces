import url from 'url';
import EventEmitter from 'events';

import Logger from '@nti/util-logger';
import {mixin} from '@nti/lib-decorators';
import uuid from 'uuid';

import {Service, DELETED} from '../constants';
import {Mixin as Pendability} from '../mixins/Pendability';
import {parse, parseListFn} from '../models/Parser';
// import getLink from '../utils/getlink';

export const MIME_TYPE = 'application/vnd.nextthought.friendslist';

const logger = Logger.get('store:Contacts');

const DATA = Symbol();
const CREATE = Symbol();

const ACTIVE_SEARCH_REQUEST = Symbol();
const ENSURE_CONTACT_GROUP = Symbol();

const CONTACTS_LIST_ID = e => `mycontacts-${e.getID()}`;

const ensureSlash = x => /\/$/.test(x) ? x : `${x}/`;

function generateID (name, context) {
	//Dataserver blows chunks if on @@ or @( at the beginning
	//look for these things and yank them out.  This was happening
	//when manipulating the list by the object url (say for deletion).
	name = (name + '').replace(/@@|@\(/ig, '');
	name = name.replace(/[^0-9A-Z\-@+._]/ig, '');
	return name + '-' + context.getID() + '_' + uuid();
}


export function getNewListData (name, isDynamic, MimeType, context, friends = []) {

	let id = generateID(name, context);


	if (Array.isArray(name)) {
		[name, id] = name;
	}

	return {
		MimeType,
		Username: id,
		alias: name,
		friends,
		IsDynamicSharing: !!isDynamic
	};
}


export default
@mixin(Pendability)
class Contacts extends EventEmitter {

	/**
	 * Contacts constructor
	 *
	 * @param {Service} service The service descriptor.
	 * @param {string} entryPoint The URL to interact with.
	 * @param {User} context The user.
	 *
	 * @return {void}
	 */
	constructor (service, entryPoint, context) {
		super();
		Object.assign(this, {
			[Service]: service,
			[DATA]: [],
			RESERVED_GROUP_ID: CONTACTS_LIST_ID(context),
			entryPoint,
			context
		});

		this.initMixins();

		this.onChange = this.onChange.bind(this);

		const parseList = parseListFn(this, service);
		this.load = uri => service.get(uri).then(o => parseList(Object.values(o.Items || [])));
		this.get = id => service.get(url.resolve(ensureSlash(entryPoint),id)).then(o => service.getObject(o));

		if (process.browser) {
			this.on('load', (_, time) => logger.debug('Load: %s %o', time, this));
		}

		this.loading = true;
		const start = Date.now();

		const load = this.load(entryPoint)
			.then(x => this[DATA].push(...x))
			.then(()=> this[ENSURE_CONTACT_GROUP]())
			.catch(er => {
				logger.error('%s\n\tContracts Group: %o', er.stack || er.message || 'There was a problem (error message is empty)', er.ContactsGroup || (er.stack ? null : er));
				this.error = true;
			})
			.then(() => {
				this.loading = false;
				this.loaded = Date.now();
				this.emit('load', this, `${(this.loaded - start)}ms`);
				this.emit('change', this);
			});

		this.addToPending(load);
	}


	[ENSURE_CONTACT_GROUP] () {
		const {RESERVED_GROUP_ID} = this;

		if(!this.getContactsList()) {

			const ContactsGroup = getNewListData(['My Contacts', RESERVED_GROUP_ID], false, MIME_TYPE, this.context);

			return this[CREATE](ContactsGroup)
				.catch(e => e.statusCode === 409
					//409? ok... it was created by another process (or a previous request)...fetch it
					? this.get(RESERVED_GROUP_ID).then(x => this[DATA].unshift(x))
					: Promise.reject(Object.assign(e, {ContactsGroup}))
				);
		}
	}


	[CREATE] (data) {
		return this[Service]
			.post(this.entryPoint, data)
			.then(x => parse(this[Service], null, x))

			.then(x => this[DATA].find(i => i.getID() === x.getID())
				? Promise.reject({statusCode: 409, message: 'Already contains item??'})
				: (this[DATA].push(x) && x)
			)

			.then(x => x.on('change', this.onChange))

			.then(() => this.emit('change', this));
	}


	[Symbol.iterator] () {
		const name = x => (x && x.displayName) || '';
		const users = {};

		//We can optimize this down to the dedicated hidden List if we think we can ensure all connections get into it.
		for (let list of this[DATA]) {
			for (let user of list) {
				users[user.getID()] = user;
			}
		}

		const snapshot = Object.values(users).sort((a, b) => name(a).localeCompare(name(b)));
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


	createList (name, friends) {
		// unwrap full user entities to IDs.
		const userIds = (friends || []).map( (friend) => friend.getID ? friend.getID() : friend );
		return this[CREATE](getNewListData(name, false, MIME_TYPE, this.context, userIds));
	}


	getContactsList () {
		const {RESERVED_GROUP_ID} = this;
		return this[DATA].find(x => x.getID() === RESERVED_GROUP_ID);
	}


	getLists () {
		const {RESERVED_GROUP_ID} = this;
		return this[DATA].filter(x => x.getID() !== RESERVED_GROUP_ID);
	}


	onChange (who, what) {
		const data = this[DATA];
		if (what === DELETED) {
			const index = data.findIndex(x => x.getID() === who.getID());
			if (index < 0) {
				return;
			}

			const item = data.splice(index, 1)[0];//remove it;

			item.removeListener('change', this.onChange);
			logger.debug('Removed deleted list: %o', item);
		}

		this.emit('change', this);
	}


	/**
	 * Determins if the entity is in any of your Lists in the Contacts store.
	 *
	 * @param {string|Entity} entity The User entity, string or Model Instance.
	 *
	 * @return {boolean} true if the store has any reference to the entity.
	 */
	contains (entity) {
		let found = false;

		for (let list of this[DATA]) {
			found = list.contains(entity);
			if (found) { break; }
		}

		return found;
	}


	addContact (entity, toLists = []) {
		const getList = x => typeof x === 'object' ? x : this[DATA].find(l => l.getID() === x);

		const pending = [];
		const lists = [...toLists, this.RESERVED_GROUP_ID];

		for (let list of lists) {
			list = getList(list);

			if (!list || !list.add || list.isGroup) {
				return Promise.reject('Bad List');
			}

			pending.push(list);
		}

		return Promise.all(
			pending.map(list => list.add(entity))
		);
	}


	removeContact (entity) {
		const pending = [];
		const lists = [];
		const undo = () => this.addContact(entity, lists);

		for(let list of this[DATA]) {
			if (list.isGroup) { continue; }

			if (list.contains(entity)) {
				pending.push(list.remove(entity));
				lists.push(list);
			}
		}

		return Promise.all(pending)
			.then(() => ({lists, undo}));
	}


	entityMatchesQuery (entity, query) {
		const {displayName, realname} = entity;
		query = query && new RegExp(query, 'i');
		return !query || query.test(displayName) || query.test(realname);
	}


	async search (query, options) {
		const {
			allowAnyEntityType = false,
			allowAppUser = false,
			allowContacts = true
		} = options || {};

		const service = this[Service];
		const {context: appUser} = this;
		const parseList = parseListFn(this, service);
		const fetch = service.getUserSearchURL(query);

		if (!fetch) {
			throw new Error('No Query');
		}

		const isUser = x => x.isUser;
		const notInContacts = user => !this.contains(user) && user.getID() !== appUser.getID();
		const byDisplayName = (a, b) => a.displayName.localeCompare(b.displayName);
		const resultFilter = x => (
			(allowAnyEntityType || isUser(x))
			&& (allowAppUser || !x.isAppUser)
			&& (allowContacts || notInContacts(x))
		);
		const token = this.activeSearch = {query};

		const prevReq = this[ACTIVE_SEARCH_REQUEST];
		if (prevReq && prevReq.abort) {
			prevReq.abort();
		}

		const req = this[ACTIVE_SEARCH_REQUEST] = service.get(fetch);

		try {
			const data = await req;

			if (token !== this.activeSearch) {
				return Promise.reject('aborted');
			}

			const list = await parseList(data.Items);

			if (token !== this.activeSearch) {
				return Promise.reject('aborted');
			}

			return list.filter(resultFilter).sort(byDisplayName);
		}
		finally {
			if (token === this.activeSearch) {
				delete this[ACTIVE_SEARCH_REQUEST];
			}
		}
	}
}
