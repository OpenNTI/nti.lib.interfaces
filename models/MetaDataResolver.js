import {Service} from '../CommonSymbols';

import Vimeo from './MetaDataResolverForVimeo';
import YouTube from './MetaDataResolverForYouTube';

const services = {
	vimeo: Vimeo,
	youtube: YouTube
};

const resolve = Promise.reject.bind(Promise, 'No resolver for service');

export default class MetaDataResolver {

	static from (source) {
		let service = source[Service];

		let resolver = services[source.service] || {resolve};

		return resolver.resolve(service, source)
			.then(meta => new MetaDataResolver(service, meta));
	}


	constructor (service, meta) {
		this[Service] = service;
		Object.assign(this, meta);
		// console.log(this);
	}
}
