import Base from '../Base';
import {
	Service
} from '../../CommonSymbols';

import setAndEmit from '../../utils/getsethandler';
import urlJoin from '../../utils/urljoin';


import assets from '../mixins/PresentationResources';

import VideoIndex from '../VideoIndex';
import ToC from '../XMLBasedTableOfContents';

const VideoIndexReqest = Symbol('VideoIndexReqest');

export default class Package extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, assets);

		this.author = (data.DCCreator || []).join(', ');

		this.addToPending(
			this.getAsset('landing').then(setAndEmit(this, 'icon')),
			this.getAsset('thumb').then(setAndEmit(this, 'thumb'))
		);
	}


	getPresentationProperties () {
		return {
			author: this.author,
			title: this.title,
			label: this.label,
			icon: this.icon,
			background: this.background,
			thumb: this.thumb
		};
	}


	getDefaultAssetRoot () {
		let root = this.root;

		if (!root) {
			console.error('No root for content package: ', this);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
	}


	getDiscussions () { return Promise.reject('Not Implemented'); }


	getTableOfContents () {
		let service = this[Service];
		let toc = this.tableOfContents;
		let cache = service.getDataCache();
		let cached = cache.get(this.index);

		if (!toc) {
			toc = cached ?
				Promise.resolve(cached) :
				service.get(this.index).then(data =>
						cache.set(this.index, data) && data);

			toc = toc.then(o => new ToC(service, this, o));

			this.tableOfContents = toc;
		}

		return toc;
	}


	getVideoIndex () {
		let service = this[Service];
		let promise = this[VideoIndexReqest];
		let cache = service.getDataCache();

		function find(toc) {
			return toc.getVideoIndexRef() || Promise.reject('No Video Index');
		}

		function get(url) {
			let cached = cache.get(url);
			if (cached) {
				return cached;
			}

			return service.get(url)
				.then(data => cache.set(url, data) && data);
		}


		if (!promise) {
			this[VideoIndexReqest] = promise = this.getTableOfContents()
				.then(toc =>
					Promise.resolve(toc)
						.then(find)
						.then(urlJoin.bind(this, this.root))
						.then(get)
						.then(VideoIndex.build.bind(VideoIndex, this[Service], this, toc)));
		}

		return promise;
	}
}
