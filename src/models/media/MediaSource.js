import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import MetaDataResolver from './MetaDataResolver';
import MediaSourceFactory from './MediaSourceFactory';

const resolver = Symbol('Resolver');
const resolveCanAccess = Symbol('Resolve Can Access');

export default
@model
class MediaSource extends Base {
	static MimeType = [
		COMMON_PREFIX + 'ntivideosource',
		COMMON_PREFIX + 'videosource',
		COMMON_PREFIX + 'mediasource',
	]

	static Fields = {
		...Base.Fields,
		'href':    { type: 'string' },
		'source':  { type: 'string' },
		'service': { type: 'string' },
	}

	static from (service, uri) {
		/* async */
		return MediaSourceFactory.from(service, uri);
	}

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getResolver () {
		return this[resolver] || (
			this[resolver] = MetaDataResolver.from(this)
				.then(meta=>Object.assign(this, meta))
		);
	}


	resolveCanAccess () {
		return this[resolveCanAccess] || (
			this[resolver] = MetaDataResolver.resolveCanAccess(this)
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
