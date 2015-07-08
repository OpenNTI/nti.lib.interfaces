import {EventEmitter} from 'events';

// import QueryString from 'query-string';

import mixin from '../utils/mixin';

import Pendability from '../models/mixins/Pendability';

// import getLink from '../utils/getlink';

import {Service} from '../CommonSymbols';

import {parseListFn} from './Library';
export const MIME_TYPE = 'application/vnd.nextthought.friendslist';

const DATA = Symbol();

const CONTACTS_LIST_ID = e => `mycontacts-${e.getID()}`;

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
			reservedGroupId: CONTACTS_LIST_ID(context),
			entryPoint,
			context
		});

		mixin(this, Pendability);

		let parseList = parseListFn(this, service);
		this.load = url => service.get(url).then(o => parseList(Object.values(o.Items || [])));

		console.log(this);

		this.load(entryPoint).then(console.log.bind(console));
	}
}
