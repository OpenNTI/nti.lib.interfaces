import Logger from '@nti/util-logger';

import { Service, DELETED } from '../constants.js';
import { parse } from '../models/Parser.js';
import maybeWait from '../utils/maybe-wait.js';

import { getNewListData } from './Contacts.js';
import EntityStore from './EntityStore.js';

export const MIME_TYPE = 'application/vnd.nextthought.dynamicfriendslist';

const logger = Logger.get('store:Groups');

const CREATE = Symbol();

export default class Groups extends EntityStore {
	/**
	 * Groups constructor
	 *
	 * @param {Service} service The service descriptor.
	 * @param {string} entryPoint The URL to interact with.
	 * @param {User} context The user.
	 *
	 * @returns {void}
	 */
	constructor(service, entryPoint, context) {
		super(service, entryPoint, context);
	}

	[CREATE](data) {
		return this[Service].post(this.entryPoint, data)
			.then(x => maybeWait(parse(this[Service], null, x)))

			.then(x =>
				this['get:Data']().find(i => i.getID() === x.getID())
					? Promise.reject('Already contains item??')
					: this['get:Data']().push(x) && x
			)

			.then(x => x.on('change', this.onChange))

			.then(() => this.emit('change', this));
	}

	onChange(who, what) {
		let data = this['get:Data']();
		if (what === DELETED) {
			let index = data.findIndex(x => x.getID() === who.getID());
			if (index < 0) {
				return;
			}

			let item = data.splice(index, 1)[0]; //remove it;

			item.removeListener('change', this.onChange);
			logger.debug('Removed deleted/left group: %o', item);
		}

		this.emit('change', this);
	}

	createGroup(name, members) {
		return this[CREATE](
			getNewListData(name, true, MIME_TYPE, this.context, members)
		);
	}
}
