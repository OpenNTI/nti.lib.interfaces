import {KalturaProvider} from './providers';

const INSTANCES = new WeakMap();

export default class MetaDataResolverForKaltura {

	static resolve (service, source) {
		return this.getProvider(service).resolveEntity(source);
	}


	static resolveCanAccess (service, source) {
		return fetch(this.getProvider(service).getURL(source))
			.then(
				(r) => r.ok ? true : false,
				()  => false
			);
	}


	static getProvider (service) {
		const provider = INSTANCES.get(service) || new KalturaProvider(service);
		if (!INSTANCES.has(service) && service != null) {
			INSTANCES.set(service, provider);
		}
		return provider;
	}
}
