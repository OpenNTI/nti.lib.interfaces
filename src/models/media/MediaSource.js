import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import MetaDataResolver from './MetaDataResolver';

const resolver = Symbol('Resolver');

@model
export default class MediaSource extends Base {
	static MimeType = [
		COMMON_PREFIX + 'mediasource',
		COMMON_PREFIX + 'videosource',
	]

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getResolver () {
		return this[resolver] || (
			this[resolver] = MetaDataResolver.from(this)
				.then(meta=>Object.assign(this, meta))
		);
	}


	doesExist () {
		return this.getResolver();
	}


	getProperty (prop) {
		return this[prop] ?
			Promise.resolve(this[prop]) :
			this.getResolver()
				.then(()=>this[prop]);
	}


	getPoster () {
		return this.getProperty('poster');
	}


	getThumbnail () {
		return this.getProperty('thumbnail')
			.then(()=>this.thumbnail || this.poster);
	}


	getTitle () {
		return this.getProperty('title');
	}
}
