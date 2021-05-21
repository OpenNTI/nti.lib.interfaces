import EventEmitter from 'events';

import Logger from '@nti/util-logger';

import { Service } from '../constants.js';
import { mixin as Pendability } from '../mixins/Pendability.js';
// import getLink from '../utils/get-link.js';
import { parseListFn } from '../models/Parser.js';

/** @typedef {import('../models/entities/User.js').default} User */

const logger = Logger.get('store:EntityStore');
const DATA = Symbol();

export default class EntityStore extends Pendability(EventEmitter) {
	/**
	 * constructor
	 *
	 * @param {Service} service The service descriptor.
	 * @param {string} entryPoint The URL to interact with.
	 * @param {User} context The user.
	 * @returns {void}
	 */
	constructor(service, entryPoint, context) {
		super();
		Object.assign(this, {
			[Service]: service,
			[DATA]: [],
			entryPoint,
			context,
		});

		this.onChange = this.onChange && this.onChange.bind(this);

		let parseList = parseListFn(this, service);
		this.fetch = (url = entryPoint) =>
			service.get(url).then(o => parseList(Object.values(o.Items || [])));

		if (process.browser) {
			this.on('load', (_, time) =>
				logger.debug('Load: %s %o', time, this)
			);
		}

		this.addToPending(this.load());
	}

	async load() {
		this.loading = true;
		let start = Date.now();

		try {
			this[DATA] = await this.fetch(this.entryPoint);
		} catch (er) {
			logger.error(er.message || er);
			this.error = true;
		}

		this.loading = false;
		this.loaded = Date.now();
		this.emit('load', this, `${this.loaded - start}ms`);
		this.emit('change', this);
	}

	['get:Data']() {
		return this[DATA];
	}

	[Symbol.iterator]() {
		let snapshot = this[DATA].slice();
		let { length } = snapshot;
		let index = 0;

		snapshot = snapshot.sort((a, b) =>
			((a && a.displayName) || '').localeCompare(
				(b && b.displayName) || ''
			)
		);

		return {
			next() {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			},
		};
	}
}
