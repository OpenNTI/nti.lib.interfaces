import {EventEmitter} from 'events';

import mixin from '../utils/mixin';

import Pendability from '../models/mixins/Pendability';

import {Service} from '../CommonSymbols';

import {parseListFn} from './Library';


export default class Achievements extends EventEmitter {

	constructor (service, owner, data) {
		super();
		Object.assign(this, {
			[Service]: service,
			owner,
			[data]: {},
			loading: true
		});

		mixin(this, Pendability);

		let parseList = parseListFn(this, service);
		let loadBin = (name, href) => service.get(href)
											.then(parseList)
											.then(value=> Object.defineProperty(name, {value}));

		let start = Date.now();
		let loads = [];

		for (let collection of (data.Items || [])) {
			let {Title, href} = collection;
			loads.push(loadBin(
				Title
					.replace(/All$/i, 'available')
					.replace(/Badges$/i, '')
					.toLowerCase(), href));
		}

		loads = Promise.all(loads).then(() => {
			this.loading = false;
			this.loaded = Date.now();
			this.emit('load', this, `${(this.loaded - start)}ms`);
			this.emit('change', this);
		});

		this.addToPending(loads);

		this.on('load', (_, time) => console.log('Load: %s %o', time, this));
	}


	getAvailable () {
		return this.waitForPending().then(()=> this.available);
	}


	getEarned () {
		return this.waitForPending().then(()=> this.earned);
	}


	getEarnable () {
		return this.waitForPending().then(()=> this.earnable);
	}
}
