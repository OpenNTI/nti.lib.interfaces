import {KalturaProvider} from './providers';


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
		return this.provider || (this.provider = new KalturaProvider(service));
	}
}
