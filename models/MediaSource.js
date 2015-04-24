import Base from './Base';

import MetaDataResolver from './MetaDataResolver';

const resolver = Symbol('Resolver');

export default class MediaSource extends Base{
	constructor(service, parent, data) {
		super(service, parent, data);
	}


	getResolver () {
		return this[resolver] || (
			this[resolver] = MetaDataResolver.from(this)
				.then(meta=>Object.assign(this, meta))
		);
	}


	getPoster () {
		return this.poster ?
			Promise.resolve(this.poster) :
			this.getResolver()
				.then(()=>this.poster);
	}

	getThumbnail () {
		return this.thumbnail ?
			Promise.resolve(this.thumbnail) :
			this.getResolver()
				.then(()=>this.thumbnail || this.poster);
	}
}
