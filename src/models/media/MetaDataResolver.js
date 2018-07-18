import {Service} from '../../constants';

import Vimeo from './MetaDataResolverForVimeo';
import YouTube from './MetaDataResolverForYouTube';
import Kaltura from './MetaDataResolverForKaltura';

const services = {
	vimeo: Vimeo,
	youtube: YouTube,
	kaltura: Kaltura
};

const resolve = () => Promise.reject('No resolver for service');
const resolveCanAccess = () => Promise.reject('No resolve access for service');

export default class MetaDataResolver {

	static getProvider (source) {
		return services[source.service] || { resolve, resolveCanAccess };
	}


	static async from (source) {
		let service = source[Service];
		const provider = this.getProvider(source);
		const meta = await provider.resolve(service, source);
		return new MetaDataResolver(service, meta, provider);
	}


	static resolveCanAccess (source) {
		const service = source[Service];

		const provider = this.getProvider(source);

		return provider.resolveCanAccess ? provider.resolveCanAccess(service, source) : resolveCanAccess();
	}


	constructor (service, meta, provider) {
		this[Service] = service;
		this.provider = provider;
		Object.assign(this, meta);
		// console.log(this);
	}
}
