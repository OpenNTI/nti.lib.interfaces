import {EventEmitter} from 'events';

import QueryString from 'query-string';

import browser from '../utils/browser';
import mixin from '../utils/mixin';

import Pendability from '../models/mixins/Pendability';

import getLink from '../utils/getlink';

import {Service, DELETED} from '../CommonSymbols';

import {parseListFn} from '../models';

const DATA = Symbol();

export default class Stream extends EventEmitter {
	/**
	 * constructor
	 *
	 * @param {Service} service		Service document instance.
	 * @param {Model} owner			Parent object. (the thing that called the constructor)
	 * @param {string|Promise} href			initial URL to load.
	 * @param {object} options		Query-String param object.
	 * @param {function} collator	Optional collator function that returns an array, given an array in its first argument.
	 * @return {void}
	 */
	constructor (service, owner, href, options = {}, collator = null) {
		super();
		Object.assign(this, {
			[Service]: service,
			[DATA]: [],
			owner,
			href,
			options,
			collator
		});

		mixin(this, Pendability);
		this.onChange = this.onChange.bind(this);

		let parseList = parseListFn(this, service);

		this.load = url => service.get(url)
								.then(o => {
									this.next = getLink(o, 'batch-next');
									// this.prev = getLink(o, 'batch-prev');
									console.debug('Stream has more? ', !!this.next);
									return parseList(o.Items || []);
								});

		if (browser) {
			this.on('load', (_, time) => console.log('Load: %s %o', time, this));
		}

		if (href.then) {
			this.addToPending(
				href.then(
					x => this.href = x,
					()=> Object.assign(this, {error: true, href: null})
				));
		}

		this.nextBatch();
	}


	onChange (who, what) {
		let data = this[DATA];
		if (what === DELETED) {
			let index = data.findIndex(x => x.getID() === who.getID());
			if (index < 0) {
				return;
			}

			let item = data.splice(index, 1)[0];//remove it;

			item.removeListener('change', this.onChange);
			console.debug('Removed deleted item: %o', item);
		}

		this.emit('change', this);
	}

	/**
	 * Returns true if there is more to load from the stream. (show a load more button)
	 *
	 * @return {boolean} True, if there is more, False, otherwise.
	 */
	get more () {
		return !!this.next;
	}


	nextBatch () {
		this.loading = true;
		let start = Date.now();
		this.emit('change', this);

		return this.waitForPending().then(() => {
			let delay = Date.now() - start;
			if (delay > 1) {
				console.debug('Now Loading... Delayed %sms', delay);
			}

			start = Date.now();

			let query = this.options ? QueryString.stringify(this.options) : '';

			let next = this.next || (this.href + (this.href.indexOf('?') === -1 ? '?' : '&') + query);

			let loads = this.load(next)
				.then(v => this[DATA] = this[DATA].concat(v))
				.catch(er => {
					console.log(er);
					this.error = true;
				})
				.then(() => {
					this.loading = false;
					this.loaded = Date.now();
					this.emit('load', this, `${(this.loaded - start)}ms`);
					this.emit('change', this);
				});

			this.addToPending(loads);

			return loads.then(()=> this);
		});
	}


	get items () {
		let {collator} = this;
		let data = this[DATA];

		return collator ? collator(data) : data;
	}


	get length () {
		return this.items.length;
	}


	map (...args) {
		return this.items.map(...args);
	}


	[Symbol.iterator] () {
		return this.items[Symbol.iterator]();
	}


	//Meant for posts to activity so we don't have to reload... do not abuse.
	insert (item) {
		if (this.prev) {
			//Not on the first page... so just drop.
			return;
		}
		this[DATA].unshift(item);
		item.on('change', this.onChange);
		this.emit('change');
	}
}
