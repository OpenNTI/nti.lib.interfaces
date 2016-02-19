import parseDate from '../../utils/parse-date';
import Logger from 'nti-util-logger';

import {getCacheFor} from './InstanceCacheContainer';

const isNewer = (x, i) => parseDate(x['Last Modified']) > i.getLastModified();

const logger = Logger.get('InstanceCacheable');

export function getInstanceCache (parent) {
	const test = p => !!getCacheFor(p) || !p || !p.parent;
	const container = test(parent) ? parent : parent.parent({test});

	return getCacheFor(container);
}

export function parseOrRefresh (service, parent, data) {
	const Cls = this;
	const cache = parent && getInstanceCache(parent);
	const {NTIID: id} = data;

	const map = cache || {};

	let inst = map[id];
	if (!inst) {
		let allowNewInstance = Boolean(cache) || Cls.AllowWildDisconntectedInstances;
		if (!cache) {
			logger.warn('Rogue Instance! %o This parent does not desend from an InstanceCacheContainer: %o', data, parent);
		}

		inst = map[id] = allowNewInstance
			? new Cls(service, parent, data)
			: void 0;
	}

	//Refresh if newer data
	else if (isNewer(data, inst)) {
		inst.refresh(data);
	}

	return inst;
}

export function cacheClassInstances (Clazz) {
	Clazz.parse = parseOrRefresh;
}
