import { Service } from '../../constants.js';

import Vimeo from './MetaDataResolverForVimeo.js';
import YouTube from './MetaDataResolverForYouTube.js';
import Kaltura from './MetaDataResolverForKaltura.js';
import Wistia from './MetaDataResolverForWistia.js';

const services = {
	vimeo: Vimeo,
	youtube: YouTube,
	kaltura: Kaltura,
	wistia: Wistia,
};

const resolve = () => Promise.reject('No resolver for service');
const resolveCanAccess = () => Promise.reject('No resolve access for service');

export default class MetaDataResolver {
	static services = services;

	static getProvider(source) {
		return services[source.service] || { resolve, resolveCanAccess };
	}

	static async from(source) {
		let service = source[Service];
		const provider = this.getProvider(source);
		const meta = await provider.resolve(service, source);
		return new MetaDataResolver(service, meta, provider);
	}

	static resolveCanAccess(source) {
		const service = source[Service];

		const provider = this.getProvider(source);

		return provider.resolveCanAccess
			? provider.resolveCanAccess(service, source)
			: resolveCanAccess();
	}

	constructor(service, meta, provider) {
		this[Service] = service;
		this.provider = provider;
		Object.assign(this, meta);
		// console.log(this);
	}
}
