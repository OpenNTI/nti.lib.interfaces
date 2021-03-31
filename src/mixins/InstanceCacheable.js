import { Parsing } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import { Service } from '../constants.js';

import { getCacheFor } from './InstanceCacheContainer.js';

//A model can implement a getter with this symbol that will return a boolean. (True if the model wants to be rereshed)
//If the new data has a newer Modified time, it will always be refreshed.
export const ShouldRefresh = Symbol('InstanceCacheable:ShouldRefresh');

//After we refresh a model, if it implements this method, call it.
export const AfterInstanceRefresh = Symbol(
	'InstanceCacheableL:AfterInstanceRefresh'
);

const shouldRefresh = (x, i) =>
	i[ShouldRefresh] ||
	Parsing.parseDate(x['Last Modified']) >= i.getLastModified();

const logger = Logger.get('InstanceCacheable');

export function getInstanceCache(parent) {
	// const test = p => !!getCacheFor(p) || !p || !p.parent;
	// const container = test(parent) ? parent : parent.parent({test});
	const container = parent[Service];

	return getCacheFor(container);
}

export function parseOrRefresh(service, parent, data) {
	const Cls = this;
	const cache = parent && getInstanceCache(parent);
	let { NTIID: id } = data;

	const map = cache || {};

	if (Cls.deriveCacheKeyFrom) {
		id = Cls.deriveCacheKeyFrom(data);
	}

	let inst = map[id];
	if (!inst || !id) {
		let allowNewInstance =
			Boolean(cache) || Cls.AllowWildDisconnectedInstances;
		if (!cache) {
			logger.warn(
				'Rogue Instance! %o This parent does not desend from an InstanceCacheContainer: %o',
				data,
				parent
			);
		}

		inst = map[id] = allowNewInstance
			? new Cls(service, parent, data)
			: void 0;
	}

	//Refresh if newer data
	else if (shouldRefresh(data, inst)) {
		const old = inst.toJSON();
		inst.refresh(data)
			//Check to see if the instance implements AfterInstanceRefresh.
			.then(
				() =>
					inst[AfterInstanceRefresh] &&
					inst[AfterInstanceRefresh](data, old),
				inst
			);
	}

	return inst;
}

export function cacheClassInstances(Clazz) {
	Clazz.parse = parseOrRefresh;
}
