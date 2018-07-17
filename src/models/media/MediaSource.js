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
		'dataset':   { type: 'object' }, //From a parsed DomObject
		'href':      { type: 'string' },
		'poster':    { type: 'string' }, //From a parsed DomObject
		'service':   { type: 'string' },
		'source':    { type: 'string' },
		'width':     { type: 'number' },
		'height':    { type: 'number' },
		'thumbnail': { type: 'string' }, //From a parsed DomObject
		'title':     { type: 'string' }, //From a parsed DomObject
		'type':      { type: 'string' },
		'duration':  { type: 'number' }
	}

	static from (service, uri) {
		/* async */
		return MediaSourceFactory.from(service, uri);
	}

	constructor (service, parent, data) {
		super(service, parent, data);
		this.meta = {};
	}


	getResolver () {
		return this[resolver] || (
			this[resolver] = MetaDataResolver.from(this)
				.then(meta=> this.meta = meta)
		);
	}


	resolveCanAccess () {
		return this[resolveCanAccess] || (
			this[resolveCanAccess] = MetaDataResolver.resolveCanAccess(this)
		);
	}


	doesExist () {
		return this.getResolver();
	}


	getProperty (prop) {
		return this.meta[prop] ?
			Promise.resolve(this.meta[prop]) :
			this.getResolver()
				.then(()=>this.meta[prop]);
	}


	getPoster () {
		return this.getProperty('poster');
	}


	getThumbnail () {
		return this.getProperty('thumbnail')
			.then(()=>this.meta.thumbnail || this.thumbnail || this.poster);
	}


	getTitle () {
		return this.getProperty('title');
	}


	getDuration () {
		return this.getProperty('duration');
	}
}
