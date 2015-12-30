import {EventEmitter} from 'events';

import browser from '../utils/browser';

// import QueryString from 'query-string';

import Pendability from '../models/mixins/Pendability';

import mixin from '../utils/mixin';
// import getLink from '../utils/getlink';

import {parseListFn} from '../models';

import {Service} from '../constants';

const DATA = Symbol();

export default class EntityStore extends EventEmitter {

	/**
	 * constructor
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
			entryPoint,
			context
		});

		mixin(this, Pendability);
		this.onChange = this.onChange && this.onChange.bind(this);

		let parseList = parseListFn(this, service);
		this.load = url => service.get(url).then(o => parseList(Object.values(o.Items || [])));

		if (browser) {
			this.on('load', (_, time) => console.log('Load: %s %o', time, this));
		}

		this.loading = true;
		let start = Date.now();

		let load = this.load(entryPoint)
			.then(x => this[DATA].push(...x))
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


	['get:Data'] () {
		return this[DATA];
	}


	[Symbol.iterator] () {
		let snapshot = this[DATA].slice();
		let {length} = snapshot;
		let index = 0;

		snapshot = snapshot.sort((a, b) => ((a && a.displayName) || '').localeCompare((b && b.displayName) || ''));

		return {

			next () {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			}

		};
	}
}