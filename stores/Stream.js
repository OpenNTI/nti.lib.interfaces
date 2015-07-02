import {EventEmitter} from 'events';

import QueryString from 'query-string';

import mixin from '../utils/mixin';

import Pendability from '../models/mixins/Pendability';

import getLink from '../utils/getlink';

import {Service} from '../CommonSymbols';

import {parseListFn} from './Library';

const DATA = Symbol();

export default class Stream extends EventEmitter {
	/**
	 * constructor
	 *
	 * @param {Service} service		Service document instance.
	 * @param {Model} owner			Parent object. (the thing that called the constructor)
	 * @param {string} href			initial URL to load.
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
			collator,
			loading: true
		});

		mixin(this, Pendability);

		let parseList = parseListFn(this, service);

		this.load = url => service.get(url)
								.then(o => {
									this.next = getLink(o, 'batch-next');
									return parseList(o.Items || []);
								});

		this.nextBatch();
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
		return this.waitForPending().then(() => {

			let start = Date.now();

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

			this.on('load', (_, time) => console.log('Load: %s %o', time, this));

			return loads.then(()=> this);
		});
	}


	get items () {
		let {collator} = this;
		let data = this[DATA];

		return collator ? collator(data) : data;
	}

	map (...args) {
		return this.items.map(...args);
	}


	[Symbol.iterator] () {
		return this.items()[Symbol.iterator]();
	}
}
