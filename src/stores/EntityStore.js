import EventEmitter from 'events';

import {mixin} from 'nti-lib-decorators';
import Logger from 'nti-util-logger';
// import QueryString from 'query-string';

import {Service} from '../constants';
import {Mixin as Pendability} from '../mixins/Pendability';
// import getLink from '../utils/getlink';
import {parseListFn} from '../models/Parser';


const logger = Logger.get('store:EntityStore');
const DATA = Symbol();

@mixin(Pendability)
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

		this.initMixins();
		this.onChange = this.onChange && this.onChange.bind(this);

		let parseList = parseListFn(this, service);
		this.load = url => service.get(url).then(o => parseList(Object.values(o.Items || [])));

		if (process.browser) {
			this.on('load', (_, time) => logger.info('Load: %s %o', time, this));
		}

		this.loading = true;
		let start = Date.now();

		let load = this.load(entryPoint)
			.then(x => this[DATA].push(...x))
			.catch(er => {
				logger.error(er.message || er);
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
