import {Service} from '../../constants';

import Vimeo from './MetaDataResolverForVimeo';
import YouTube from './MetaDataResolverForYouTube';
import Kaltura from './MetaDataResolverForKaltura';

const services = {
	vimeo: Vimeo,
	youtube: YouTube,
	kaltura: Kaltura
};

const resolve = Promise.reject.bind(Promise, 'No resolver for service');
const resolveCanAccess = () => Promise.reject('No resolve access for service');

export default class MetaDataResolver {

	static from (source) {
		let service = source[Service];

		let resolver = services[source.service] || {resolve};

		return resolver.resolve(service, source)
			.then(meta => new MetaDataResolver(service, meta));
	}


	static resolveCanAccess (source) {
		const service = source[Service];

		const resolver = services[source.service] || {resolveCanAccess};

		return resolver.resolveCanAccess ? resolver.resolveCanAccess(service, source) : resolveCanAccess();
	}


	constructor (service, meta) {
		this[Service] = service;
		Object.assign(this, meta);
		// console.log(this);
	}
}
