import { decorate } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import { Service } from '../../constants';
import TablesOfContents from '../content/TablesOfContents';
import MediaIndex from '../media/MediaIndex';
import { Publishable } from '../../mixins';
import { model, COMMON_PREFIX } from '../Registry';
import Base from '../Base';
import Forum from '../forums/Forum';

import BundleCommunity from './BundleCommunity';
import BundleStreamDataSource from './BundleStreamDataSource.js';
import BundleSearchDataSource from './BundleSearchDataSource.js';

const BundleCommunityCache = Symbol('Bundle Community Cache');

const names = (x, y, v) => (Array.isArray(v) ? v.join(', ') : null);

class Bundle extends Base {
	static MimeType = [
		COMMON_PREFIX + 'contentpackagebundle',
		COMMON_PREFIX + 'coursecontentpackagebundle',
		COMMON_PREFIX + 'publishablecontentpackagebundle',
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'Discussions':                          { type: 'model'                     },
		'DCCreator':                            { type: names,     name: 'author'   },
		'byline':                               { type: 'string'                    },
		'title':                                { type: 'string'                    },
		'label':                                { type: 'string'                    },
		'PlatformPresentationResources':        { type: 'object'                    },
		'root':                                 { type: 'string'                    },
		'Reports':								{ type: 'model[]'					},
		'PublicationState':                     { type: 'string'                    }
	}

	#contentPackages = null;

	isBundle = true;

	constructor(service, parent, data) {
		super(service, parent, data);

		this.addToPending(resolveDiscussions(this));
	}

	async refreshContentPackages() {
		await this.refresh();

		await this.#contentPackages;
		this.#contentPackages = null;
		return this.getContentPackages();
	}

	async getContentPackages() {
		if (!this.#contentPackages) {
			this.#contentPackages = resolvePackages(this);
			this.#contentPackages = await this.#contentPackages;

			const onChange = (...args) => this.onChange(...args);

			for (let p of this.#contentPackages) {
				p.on('change', onChange);
			}
		}

		return this.#contentPackages;
	}

	get packageRoot() {
		throw new Error(
			'packageRoot is depricated, unless you really need it than we can add it back'
		);
	}

	isPublished() {
		return (
			this.MimeType !==
				'application/vnd.nextthought.publishablecontentpackagebundle' ||
			!!this.PublicationState
		);
	}

	async containsPackage(id) {
		const packages = await this.getContentPackages();

		let found = false;

		for (let pkg of packages) {
			if (pkg.getID() === id) {
				found = true;
				break;
			}
		}

		//Are bundle NTIIDs being passed around like packageIds? If so, this will catch it.
		return found || this.getID() === id;
	}

	async getPackage(id) {
		const packages = await this.getContentPackages();

		for (let pkg of packages) {
			if (pkg.getID() === id || pkg.OID === id) {
				return pkg;
			}
		}

		return null;
	}

	getPresentationProperties() {
		return {
			author: this.author,
			title: this.title,
			label: this.label,
		};
	}

	hasCommunity() {
		return BundleCommunity.hasCommunity(this);
	}

	getCommunity() {
		if (!this[BundleCommunityCache]) {
			this[BundleCommunityCache] = BundleCommunity.from(this);
		}

		return this[BundleCommunityCache];
	}

	async getDiscussions(reloadBoard) {
		if (!this.Discussions) {
			this.Discussions = await this.fetchLinkParsed('DiscussionBoard');
		} else if (reloadBoard) {
			await this.Discussions.refresh();
		}

		const data = await this.Discussions.getContents();

		return [data];
	}

	getForumType() {
		return Forum.MimeTypes[2];
	}

	hasDiscussions() {
		return this.hasLink('DiscussionBoard');
	}

	async getTablesOfContents() {
		const packages = await this.getContentPackages();

		return Promise.all(
			packages.map(p => p.getTableOfContents())
		).then(tables =>
			TablesOfContents.fromIterable(tables, this[Service], this)
		);
	}

	getDefaultShareWithValue(preferences) {
		return preferences ? preferences.value : [];
	}

	getDefaultSharing() {
		return {
			scopes: [],
		};
	}

	getVideoIndex() {
		return Promise.all(this.map(pkg => pkg.getVideoIndex())).then(indices =>
			MediaIndex.combine(indices)
		);
	}

	getStreamDataSource() {
		return new BundleStreamDataSource(this[Service], this);
	}

	getSearchDataSource() {
		return new BundleSearchDataSource(this[Service], this);
	}
}

async function resolveDiscussions(bundle) {
	if (bundle.Discussions) {
		return;
	}

	try {
		// eslint-disable-next-line require-atomic-updates
		bundle.Discussions = await bundle.fetchLinkParsed('DiscussionBoard');
	} catch (e) {
		//swallow
	}
}

async function resolvePackages(bundle) {
	try {
		const contents = await bundle.fetchLinkParsed('contents');

		return contents;
	} catch (e) {
		return [];
	}
}

export default decorate(Bundle, {
	with: [model, mixin(Publishable)],
});
