import {EventEmitter} from 'events';

import QueryString from 'query-string';

import mixin from '../utils/mixin';

import Pendability from '../models/mixins/Pendability';

import getLink from '../utils/getlink';

import {Service} from '../CommonSymbols';

import {parseListFn} from './Library';


export default class Stream extends EventEmitter {

	constructor (service, owner, href, options = {}) {
		super();
		Object.assign(this, {
			[Service]: service,
			data: [],
			owner,
			href,
			options,
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


	nextBatch () {
		return this.waitForPending().then(() => {

			let start = Date.now();

			let query = this.options ? QueryString.stringify(this.options) : '';

			let next = this.next || (this.href + (this.href.indexOf('?') === -1 ? '?' : '&') + query);

			let loads = this.load(next)
				.then(v => Object.defineProperty(this, 'data', {
					value: this.data.concat(v)
				}))
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


	map (...args) {
		return this.data.map(...args);
	}
}
