import Logger from '@nti/util-logger';

import {IsModel} from '../constants';

const logger = Logger.get('models:Registry');

//exported for testing
export const MAP = Symbol('Model Map');

export const COMMON_PREFIX = 'application/vnd.nextthought.';

export const trimCommonPrefix = x => x && x.replace(/^application\/vnd.nextthought./, '').toLowerCase();

const IGNORED = {parse: x => x};


export default class Registry {


	static alias (...args) {
		return this.getInstance().alias(...args);
	}


	static lookup (...args) {
		return this.getInstance().lookup(...args);
	}


	static register (...args) {
		return this.getInstance().register(...args);
	}


	static ignore (type) {
		return this.getInstance().alias('ignored', type);
	}


	static getInstance () {
		const x = Symbol.for('Instance');
		return this[x] || (this[x] = new Registry());
	}


	constructor () {
		const m = this[MAP] = new Map();
		m.set('ignored', IGNORED);
	}


	register (o) {
		if (!o || !o.MimeType || !o.hasOwnProperty('MimeType') || typeof o !== 'function') {
			throw new TypeError(`Illegial Argument: Model class expected:
				Has Argument: ${!!o}
				Has MimeType: ${o && !!o.MimeType}
				Is Own MimeType: ${o && o.hasOwnProperty('MimeType')}: ${o.MimeType} (${o.name})
				Is Class: ${typeof o === 'function'}
				`.replace(/\t+/g, '\t'));
		}

		const MimeTypes = (Array.isArray(o.MimeType) ? o.MimeType : [o.MimeType]).filter(Boolean);
		const [MimeType] = MimeTypes;

		delete o.MimeType;
		delete o.MimeTypes;

		Object.defineProperties(o, {
			//force MimeType to be a scalar value instead of a list...
			MimeType: {
				configurable: true,
				enumerable: true,
				writable: true,
				value: MimeType
			},
			MimeTypes: {
				configurable: true,
				enumerable: true,
				writable: true,
				value: MimeTypes
			}
		});

		o.prototype[IsModel] = true;

		const types = o.MimeTypes.map(trimCommonPrefix);

		for (let type of types) {
			if (this[MAP].has(type)) {
				logger.warn('Overriding Type!! %s with %o was %o', type, o, this[MAP].get(type));
			}

			logger.debug('Registering %s to %o (%d)', type, o, this[MAP].size);
			this[MAP].set(type, o);
		}

		return o;
	}


	alias (existingType, alias) {
		const map = this[MAP];
		if (typeof existingType !== 'string' || typeof alias !== 'string') {
			throw new TypeError('aliases and types must be strings');
		}

		if (existingType === alias) {
			throw new TypeError('Cannot create an alias that is self-referencing.');
		}

		if (!map.has(existingType)) {
			throw new TypeError('Cannot alias a non-existing type');
		}

		if (map.has(alias)) {
			if (typeof map.get(alias) !== 'string') {
				throw new TypeError('Cannot alias over an existing type.');
			}

			logger.warn('Overriding Type!! %s with %o was %o', alias, existingType, map.get(alias));
		}

		logger.debug('Registering alias %s to %s', alias, existingType);
		map.set(trimCommonPrefix(alias), trimCommonPrefix(existingType));
	}


	lookup (type) {
		let m = this[MAP].get(trimCommonPrefix(type));
		logger.debug('Lookup: %s, %o', type, m);

		const seen = [type];

		//follow aliases:
		while (typeof m === 'string') {
			if (seen.includes(m)) { //break cycles.
				logger.debug('Alias Loop Detected... already seen: %s\n\t=?> %s', seen.join('\n\t=> '), m);
				m = void m; //set m to undefined (void)
			} else {
				const alias = m;
				seen.push(alias);
				m = this[MAP].get(alias);
				logger.debug('Following alias: %s, got: %o', alias, m);
			}
		}

		return m;
	}
}


//Decorator...auto register
export function model (target) {
	Registry.register(target);
}
