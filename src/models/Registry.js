import Logger from 'nti-util-logger';

const logger = Logger.get('models:Registry');

const MAP = Symbol('Model Map');

export const COMMON_PREFIX = 'application/vnd.nextthought.';

export const trimCommonPrefix = x => x.replace(/^application\/vnd.nextthought./, '').toLowerCase();


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
		return this.getInstance().alias('ignore', type);
	}


	static getInstance () {
		const x = Symbol.for('Instance');
		return this[x] || (this[x] = new Registry());
	}


	constructor () {
		const m = this[MAP] = new Map();
		m.set('ignored', {parse: x => x});
	}

	register (o) {
		if (!o || !o.MimeType || typeof o !== 'function') {
			throw new TypeError('Illegial Argument: Model class expected');
		}

		const types = (Array.isArray(o.MimeType) ? o.MimeType : [o.MimeType])
						.filter(Boolean)
						.map(trimCommonPrefix);

		for (let type of types) {
			if (this[MAP].has(type)) {
				logger.warn('Overriding Type!! %s with %o was %o', type, o, this[MAP].get(type));
			}

			logger.debug('Registering %s to %o', type, o);
			this[MAP].set(type, o);
		}

		return o;
	}


	alias (existingKey, alias) {
		if (typeof existingKey !== 'string' || typeof alias !== 'string') {
			throw new TypeError('Only existingKeys (strings) are allowed to be aliased');
		}

		if (this[MAP].has(alias)) {
			logger.warn('Overriding Type!! %s with %o was %o', alias, existingKey, this[MAP].get(alias));
		}

		logger.debug('Registering alias %s to %s', alias, existingKey);
		this[MAP].set(trimCommonPrefix(alias), trimCommonPrefix(existingKey));
	}


	lookup (type) {
		let m = this[MAP].get(trimCommonPrefix(type));

		const seen = new Set([type]);

		//follow aliases:
		while (typeof m === 'string') {
			if (seen.has(m)) { //break cycles.
				m = void m; //set m to undefined (void)
			} else {
				seen.add(m);
				m = this[MAP].get(m);
			}
		}

		return m;
	}
}


//Decorator...auto register
export function model (target) {
	Registry.register(target);
}
