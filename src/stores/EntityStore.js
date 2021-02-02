import EventEmitter from 'events';

import {decorate} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';
import Logger from '@nti/util-logger';

import {Service} from '../constants';
import {Mixin as Pendability} from '../mixins/Pendability';
// import getLink from '../utils/getlink';
import {parseListFn} from '../models/Parser';


const logger = Logger.get('store:EntityStore');
const DATA = Symbol();

class EntityStore extends EventEmitter {

	/**
	 * constructor
	 *
	 * @param {Service} service The service descriptor.
	 * @param {string} entryPoint The URL to interact with.
	 * @param {User} context The user.
	 *
	 * @returns {void}
	 */
	constructor (service, entryPoint, context) {
		super();
		Object.assign(this, {
			[Service]: service,
			[DATA]: [],
			entryPoint,
			context
		});

		this.initMixins();
		this.onChange = this.onChange && this.onChange.bind(this);

		let parseList = parseListFn(this, service);
		this.fetch = (url = entryPoint) => service.get(url).then(o => parseList(Object.values(o.Items || [])));

		if (process.browser) {
			this.on('load', (_, time) => logger.debug('Load: %s %o', time, this));
		}

		this.addToPending(this.load());
	}

	async load () {
		this.loading = true;
		let start = Date.now();

		try {
			this[DATA] = await this.fetch(this.entryPoint);
		}
		catch(er) {
			logger.error(er.message || er);
			this.error = true;
		}

		this.loading = false;
		this.loaded = Date.now();
		this.emit('load', this, `${(this.loaded - start)}ms`);
		this.emit('change', this);
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

export default decorate(EntityStore, {with:[mixin(Pendability)]});
