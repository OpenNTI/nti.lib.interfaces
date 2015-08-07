import {EventEmitter} from 'events';

// import QueryString from 'query-string';

import Pendability from '../models/mixins/Pendability';

import mixin from '../utils/mixin';
import guid from '../utils/guid';
// import getLink from '../utils/getlink';

import {parse, parseListFn} from '../models';

import {Service} from '../CommonSymbols';

export const MIME_TYPE = 'application/vnd.nextthought.friendslist';

const DATA = Symbol();
const CREATE = Symbol();

const ENSURE_CONTACT_GROUP = Symbol();

const CONTACTS_LIST_ID = e => `mycontacts-${e.getID()}`;


function generateID (name, context) {
	//Dataserver blows chunks if on @@ or @( at the beginning
	//look for these things and yank them out.  This was happening
	//when manipulating the list by the object url (say for deletion).
	name = (name + '').replace(/@@|@\(/ig, '');
	name = name.replace(/[^0-9A-Z\-@\+\._]/ig, '');
	return name + '-' + context.getID() + '_' + guid();
}


export function getNewListData (name, isDynamic, MimeType, context) {

	let id = generateID(name, context);


	if (Array.isArray(name)) {
		[name, id] = name;
	}

	return {
		MimeType,
		Username: id,
		alias: name,
		friends: [],
		IsDynamicSharing: !!isDynamic
	};
}


export default class Contacts extends EventEmitter {

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

		mixin(this, Pendability);

		let parseList = parseListFn(this, service);
		this.load = url => service.get(url).then(o => parseList(Object.values(o.Items || [])));

		this.on('load', (_, time) => console.log('Load: %s %o', time, this));

		this.loading = true;
		let start = Date.now();

		let load = this.load(entryPoint)
			.then(x => this[DATA].push(...x))
			.then(()=> this[ENSURE_CONTACT_GROUP]())
			.catch(er => {
				console.log(er.message || er);
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
		let {RESERVED_GROUP_ID} = this;

		if(!this[DATA].find(x=> x.getID() === RESERVED_GROUP_ID)) {
			return this[CREATE](getNewListData(['My Contacts', RESERVED_GROUP_ID], false, MIME_TYPE, this.context))
				.catch(e => e.statusCode !== 409 ? 0 : Promise.reject(e));
		}
	}


	[CREATE] (data) {
		return this[Service]
			.post(this.entryPoint, data)
			.then(x => parse(this[Service], null, x))

			.then(x => this[DATA].find(i => i.getID() === x.getID())
					? Promise.reject('Already contains item??')
					: (this[DATA].push(x) && x)
			)

			.then(() => this.emit('change', this));
	}


	[Symbol.iterator] () {
		let snapshot = {};

		//We can optimize this down to the dedicated hidden List if we think we can ensure all connections get into it.
		for (let list of this[DATA]) {
			for (let user of list) {
				snapshot[user.getID()] = user;
			}
		}

		snapshot = Object.values(snapshot);

		let {length} = snapshot;
		let index = 0;

		return {

			next () {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			}

		};
	}


	createList (name) {
		return this[CREATE](getNewListData(name, false, MIME_TYPE, this.context));
	}



	getLists () {
		const {RESERVED_GROUP_ID} = this;
		return this[DATA].filter(x => x.getID() !== RESERVED_GROUP_ID);
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

		let pending = [];
		let lists = [...toLists, this.RESERVED_GROUP_ID];

		for (let list of lists) {
			list = getList(list);

			if (!list || !list.add || list.isGroup) {
				return Promise.reject('Bad List');
			}

			pending.push(list);
		}

		return Promise.all(pending.map(list => list.add(entity)));
	}


	removeContact (entity) {
		let pending = [];

		for(let list of this[DATA]) {
			if (list.isGroup) { continue; }

			pending.push(list.remove(entity));
		}

		return Promise.all(pending);
	}
}
