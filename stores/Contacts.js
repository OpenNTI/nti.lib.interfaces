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


function getNewListData(name, isDynamic, context) {

	let id = generateID(name, context);


	if (Array.isArray(name)) {
		[name, id] = name;
	}

	return {
		MimeType: MIME_TYPE,
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

		window.Contacts = this;

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
			return this[CREATE](getNewListData(['My Contacts', RESERVED_GROUP_ID], false, this.context))
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


	createList (name) {
		return this[CREATE](getNewListData(name, false, this.context));
	}


	createGroup (name) {
		return this[CREATE](getNewListData(name, true, this.context));
	}
}
