import parseDate from '../../utils/parse-date';

import {getCacheFor} from './InstanceCacheContainer';

const isNewer = (x, i) => parseDate(x['Last Modified']) > i.getLastModified();


export function getInstanceCache (parent) {
	const test = p => !!getCacheFor(p);
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
		if (!cache) {
			console.warn('Rogue Instance! This parent does not desend from an InstanceCacheContainer: %o', parent);
			//TODO: Add exceptions...Ex: Grades in Notifications should not beholden to this...
		}

		// parent = cache ? parent : null;
		inst = map[id] = !cache ? void 0 : new Cls(service, parent, data);
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
