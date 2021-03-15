import { decorate, URL } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';
import { Service } from '../../constants';
import MediaIndex from '../media/MediaIndex';
import TablesOfContents from '../content/TablesOfContents';
import ToC from '../content/XMLBasedTableOfContents';
import PlacementProvider from '../../authoring/placement/providers/ContentPackage';

const logger = Logger.get('models:content:Package');

const VideoIndexReqest = Symbol('VideoIndexReqest');

const getAssociationCount = x => x.LessonContainerCount;
const names = (x, y, v) => (Array.isArray(v) ? v.join(', ') : null);

class Package extends Base {
	static MimeType = COMMON_PREFIX + 'contentpackage';

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'DCCreator':                            { type: names,    name: 'author' },
		'title':                                { type: 'string',                },
		'index':                                { type: 'string',                },
		'label':                                { type: 'string',                },
		'root':                                 { type: 'string',                },
		'icon':                                 { type: 'string',                },
		'PlatformPresentationResources':        { type: 'object'                 },
		'PresentationProperties':               { type: 'object'                 }
		// 'background': { type: 'string',                },
	}

	getDefaultShareWithValue(preferences) {
		return preferences ? preferences.value : [];
	}

	getPresentationProperties() {
		return {
			author: this.author,
			title: this.title,
			label: this.label,
		};
	}

	get associationCount() {
		return getAssociationCount(this);
	}

	getPlacementProvider(scope, accepts) {
		return new PlacementProvider(scope, this, accepts);
	}

	getAssociations() {
		return this.fetchLinkParsed('Lessons');
	}

	getObjectHref() {
		return {
			url: this[Service].getObjectURL(this.getID()),
			headers: {
				accept: this.MimeType,
			},
		};
	}

	getDefaultAssetRoot() {
		let { root } = this;

		if (!root) {
			logger.warn('No root for content package: ', this);
			return '';
		}

		return URL.join(root, 'presentation-assets', 'webapp', 'v1');
	}

	getPackage(id) {
		return id === this.getID() ? this : null;
	}

	async getDiscussions() {
		throw new Error('Not Implemented');
	}
	hasDiscussions() {
		return false;
	}

	getTablesOfContents() {
		//implement common expected interface
		return this.getTableOfContents().then(table =>
			TablesOfContents.fromIterable([table], this[Service], this)
		);
	}

	async getTableOfContents() {
		if (!this.index) {
			return [];
		}

		let service = this[Service];
		let toc = this.tableOfContents;
		let cache = service.getDataCache();
		let cached = cache.get(this.index);

		if (!toc) {
			const loadToc = cached
				? Promise.resolve(cached)
				: service
						.get(this.index)
						.then(data => cache.set(this.index, data) && data)
						.catch(() => '<toc></toc>');

			const loadRealPage = this.getRealPageIndex();

			toc = Promise.all([loadToc, loadRealPage]).then(([o, realPage]) => {
				return new ToC(service, this, o, this.title, realPage);
			});

			this.tableOfContents = toc;
		}

		return toc;
	}

	getVideoIndex() {
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

			return service.get(url).then(data => cache.set(url, data) && data);
		}

		if (!promise) {
			this[VideoIndexReqest] = promise = this.getTableOfContents().then(
				toc =>
					Promise.resolve(toc)
						.then(find)
						.then(path => URL.join(this.root, path))
						.then(get)
						.then(data =>
							MediaIndex.build(this[Service], this, toc, data)
						)
			);
		}

		return promise;
	}

	async getRealPageIndex() {
		const service = this[Service];
		const { root } = this;
		const link = URL.join(root, 'real_pages.json');

		try {
			const index = await service.get(link);

			return index;
		} catch (e) {
			return null;
		}
	}
}

export default decorate(Package, { with: [model] });
