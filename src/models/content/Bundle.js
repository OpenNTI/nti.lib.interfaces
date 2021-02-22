import { decorate, URL, forward } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';
import Logger from '@nti/util-logger';

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

const logger = Logger.get('models:content:Bundle');
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
		'ContentPackages':                      { type: 'model[]', defaultValue: [] },
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

	isBundle = true;

	constructor(service, parent, data) {
		super(service, parent, data);

		const onChange = (...args) => this.onChange(...args);

		for (let p of this.ContentPackages) {
			p.on('change', onChange);
		}

		this.addToPending(resolveDiscussions(this));
	}

	get packageRoot() {
		let root = null;
		let { ContentPackages: pks } = this;
		let { length } = pks;

		if (length > 1) {
			logger.warn(
				'Ambiguous content root. By the time we see this, I hope we ' +
					'have absolute paths for content references! Ex: transcripts' +
					' in videos, images in question content, etc'
			);
		}

		for (let i = 0; i < length && !root; i++) {
			root = pks[i].root;
		}

		return root;
	}

	isPublished() {
		return (
			this.MimeType !==
				'application/vnd.nextthought.publishablecontentpackagebundle' ||
			!!this.PublicationState
		);
	}

	containsPackage(id) {
		let found = false;

		for (let pkg of this.ContentPackages) {
			if (pkg.getID() === id) {
				found = true;
				break;
			}
		}

		//Are bundle NTIIDs being passed around like packageIds? If so, this will catch it.
		return found || this.getID() === id;
	}

	getPackage(id) {
		for (let pkg of this.ContentPackages) {
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

	getDefaultAssetRoot() {
		const root = [this, ...this.ContentPackages].reduce(
			(agg, o) => agg || o.root,
			null
		);

		if (!root) {
			if (this.ContentPackages.length > 0) {
				logger.warn(
					'No root for bundle: %s %o',
					this.getID(),
					this.ContentPackages.map(o => o.getID())
				);
			}
			return '';
		}

		return URL.join(root, 'presentation-assets', 'webapp', 'v1');
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

	getTablesOfContents() {
		return Promise.all(
			this.ContentPackages.map(p => p.getTableOfContents())
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

export default decorate(Bundle, {
	with: [
		model,
		mixin(
			forward(
				['every', 'filter', 'forEach', 'map', 'reduce'],
				'ContentPackages'
			),
			Publishable
		),
	],
});
