import EventEmitter from 'events';

import Logger from '@nti/util-logger';

import { Service } from '../constants.js';
import Pendability from '../mixins/Pendability.js';
import { parseListFn } from '../models/Parser.js';

const logger = Logger.get('store:Achievements');

export default class Achievements extends Pendability(EventEmitter) {
	constructor(service, owner, data) {
		super();
		Object.assign(this, {
			[Service]: service,
			owner,
			loading: true,
		});

		//this.onChange = this.onChange.bind(this);
		let parseList = parseListFn(this, service);
		let loadBin = (name, href) =>
			service
				.get(href)
				.then(o => parseList(o.Items || []))
				.then(value => Object.defineProperty(this, name, { value }));

		let start = Date.now();
		let loads = [];

		for (let collection of data.Items || []) {
			let { Title, href } = collection;
			loads.push(
				loadBin(
					Title.replace(/All/i, 'available')
						.replace(/Badges$/i, '')
						.toLowerCase(),
					href
				)
			);
		}

		loads = Promise.all(loads)
			.catch(er => {
				logger.error(er);
				this.error = true;
			})
			.then(() => {
				this.loading = false;
				this.loaded = Date.now();
				this.emit('load', this, `${this.loaded - start}ms`);
				this.emit('change', this);
			});

		this.addToPending(loads);

		this.on('load', (_, time) => logger.info('Load: %s %o', time, this));
	}

	getAvailable() {
		return this.waitForPending().then(() => this.available);
	}

	getEarned() {
		return this.waitForPending().then(() => this.earned);
	}

	getEarnable() {
		return this.waitForPending().then(() => this.earnable);
	}
}
