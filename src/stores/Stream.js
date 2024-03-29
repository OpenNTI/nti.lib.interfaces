import EventEmitter from 'events';

import invariant from 'invariant';

import { url } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import { Service, Parent, DELETED, SortOrder } from '../constants.js';
import Pendability from '../mixins/Pendability.js';
import getLink from '../utils/get-link.js';
import { parseListFn } from '../models/Parser.js';
import { initPrivate, getPrivate } from '../utils/private.js';

/** @typedef {import('../models/Model.js').default} Model */
/** @typedef {import('./Service.js').default} ServiceDocument */

class RetryBatch extends Error {
	constructor(fn = () => {}) {
		super('Retrying Batch');
		this.retry = fn;
	}
}

const logger = Logger.get('store:Stream');

const load = (scope, url) =>
	scope[Service].get(url).then(
		o => (scope.applyBatch(o), scope.parseList(o.Items || []))
	);

export default class Stream extends Pendability(EventEmitter) {
	/**
	 * constructor
	 *
	 * @param {ServiceDocument} service		Service document instance.
	 * @param {Model} owner			Parent object. (the thing that called the constructor)
	 * @param {string|Promise} href			initial URL to load.
	 * @param {Object} options		Query-String param object.
	 * @param {Function} collator	Optional collator function that returns an array, given an array in its first argument.
	 * @returns {void}
	 */
	constructor(service, owner, href, options = {}, collator = null) {
		super();
		Object.assign(this, {
			[Service]: service,
			[Parent]: owner,
			href,
			options,
			collator,
			continuous: true,
			onChange: this.onChange.bind(this),
		});

		initPrivate(this, { data: [] });

		if (process.browser) {
			this.on('load', (_, time) =>
				logger.debug('Load: %s %o', time, this)
			);
		}

		if (href.then) {
			this.addToPending(
				href.then(
					x => (this.href = x),
					() => Object.assign(this, { error: true, href: null })
				)
			);
		}

		this.nextBatch();
	}

	applyBatch(data) {
		const batchUnderflowed = o => !o || o.length < this.options.batchSize;

		this.next =
			!batchUnderflowed(data.Items) && getLink(data, 'batch-next');

		this.prev = getLink(data, 'batch-prev');

		logger.debug('Stream has more? ', !!this.next);
	}

	get parseList() {
		const p = getPrivate(this);

		if (!p.parseListFn) {
			const parent = this.parentItems ? this : null;
			p.parseListFn = parseListFn(this, this[Service], parent);
		}

		return p.parseListFn;
	}

	onChange(who, what) {
		const { data } = getPrivate(this);
		if (what === DELETED) {
			let index = data.findIndex(x => x.getID() === who.getID());
			if (index < 0) {
				return;
			}

			let item = data.splice(index, 1)[0]; //remove it;

			item.removeListener('change', this.onChange);
			logger.debug('Removed deleted item: %o', item);
		}

		this.emit('change', this);
	}

	setSort(sortOn, sortOrder = SortOrder.ASC) {
		const { options: op } = this;

		invariant(
			Object.values(SortOrder).includes(sortOrder),
			"sortOrder must be one of SortOrder's values."
		);

		Object.assign(op, {
			sortOn,
			sortOrder,

			batchStart: 0, //reset to begining
		});

		if (!sortOn) {
			delete op.sortOn;
			delete op.sortOrder;
		}

		//reload date... (but reload from the begining and with updated args... )
		delete this.next;
		delete this.prev;

		this.nextBatch();
	}

	getSort() {
		const { sortOn, sortOrder } = this.options;
		return { sortOn, sortOrder };
	}

	get error() {
		return getPrivate(this).error;
	}
	get loaded() {
		return getPrivate(this).loaded;
	}
	get loading() {
		return getPrivate(this).loading;
	}
	get dirty() {
		return getPrivate(this).dirty;
	}
	set dirty(dirty) {
		if (dirty) {
			getPrivate(this).dirty = true;
		}
	}

	/**
	 * Returns true if there is more to load from the stream. (show a load more button)
	 *
	 * @returns {boolean} True, if there is more, False, otherwise.
	 */
	get more() {
		return !!this.next;
	}

	retryBatch(fn) {
		throw new RetryBatch(fn);
	}

	nextBatch(prev = false) {
		const store = getPrivate(this);

		if (store.loading) {
			return Promise.resolve(this);
		}

		store.loading = true;
		store.dirty = false;

		let start = Date.now();
		this.emit('change', this);

		if (prev && this.continuous) {
			//nothing to do. We already have the previous values still in memory.
			return Promise.resolve(this);
		}

		return this.waitForPending().then(() => {
			let delay = Date.now() - start;
			if (delay > 1) {
				logger.debug('Now Loading... Delayed %sms', delay);
			}

			start = Date.now();

			const getHref = (ref, params = {}) =>
				ref && url.appendQueryParams(ref, params);

			let next =
				(prev ? this.prev : this.next) ||
				getHref(this.href, this.options);

			let loads = load(this, next)
				.then(
					v =>
						(store.data = this.continuous
							? store.data.concat(v)
							: v)
				)
				.catch(er => {
					if (er instanceof RetryBatch) {
						return er;
					}

					logger.error(er);
					store.error = true;
					store.dirty = true;
				})
				.then(token => {
					store.loading = false;

					if (token instanceof RetryBatch) {
						return token.retry();
					}

					store.loaded = Date.now();
					store.dirty = store.dirty || false;
					this.emit('load', this, `${store.loaded - start}ms`);
					this.emit('change', this);
				});

			this.addToPending(loads);

			return loads.then(() => this);
		});
	}

	//@private ... use the iterator or map to access items. Or Array.from if you _need_ an array.
	get items() {
		const { collator } = this;
		const { data } = getPrivate(this);

		return collator ? collator(data) : data;
	}

	get length() {
		return this.items.length;
	}

	find(fn) {
		return this.items.find(fn);
	}

	map(...args) {
		return this.items.map(...args);
	}

	[Symbol.iterator]() {
		return this.items[Symbol.iterator]();
	}

	//Meant for posts to activity so we don't have to reload... do not abuse.
	insert(item) {
		if (this.prev) {
			//Not on the first page... so just drop.
			return;
		}
		const { data } = getPrivate(this);
		data.unshift(item);
		item.on('change', this.onChange);
		this.emit('change');
	}
}
