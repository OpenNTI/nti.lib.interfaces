import {URL, forward} from 'nti-commons';
import {mixin} from 'nti-lib-decorators';
import Logger from 'nti-util-logger';

import { Service } from '../../constants';
import assets from '../../mixins/PresentationResources';
import setAndEmit from '../../utils/getsethandler';
import TablesOfContents from '../content/TablesOfContents';
import MediaIndex from '../media/MediaIndex';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const logger = Logger.get('models:content:Bundle');

const names = (x, y, v) => Array.isArray(v) ? v.join(', ') : null;

export default
@model
@mixin(assets, forward(['every','filter','forEach','map', 'reduce'], 'ContentPackages'))
class Bundle extends Base {
	static MimeType = [
		COMMON_PREFIX + 'contentpackagebundle',
		COMMON_PREFIX + 'coursecontentpackagebundle'
	]

	static Fields = {
		...Base.Fields,
		'ContentPackages':  { type: 'model[]', defaultValue: [] },
		'DCCreator':        { type: names,     name: 'author'   },
		'title':            { type: 'string'                    },
		'label':            { type: 'string'                    },
	}

	isBundle = true

	constructor (service, parent, data) {
		super(service, parent, data);

		for (let p of this.ContentPackages) {
			p.on('change', this.onChange);
		}

		this.addToPending(
			this.getAsset('landing').then(setAndEmit(this, 'icon')),
			this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
			this.getAsset('background').then(setAndEmit(this, 'background'))
		);
	}


	get packageRoot () {
		let root = null;
		let {ContentPackages: pks} = this;
		let {length} = pks;

		if (length > 1) {
			logger.warn(	'Ambiguous content root. By the time we see this, I hope we ' +
							'have absolute paths for content references! Ex: transcripts' +
							' in videos, images in question content, etc');
		}

		for (let i = 0; i < length && !root; i++ ) {
			root = pks[i].root;
		}

		return root;
	}


	containsPackage (id) {
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


	getPackage (id) {
		for (let pkg of this.ContentPackages) {
			if (pkg.getID() === id || pkg.OID === id) {
				return pkg;
			}
		}

		return null;
	}


	getPresentationProperties () {
		return {
			author: this.author,
			title: this.title,
			label: this.label,
			icon: this.icon,
			background: this.icon,
			thumb: this.thumb
		};
	}


	getDefaultAssetRoot () {
		const root = [this, ...this.ContentPackages]
			.reduce((agg, o) => agg || o.root, null);

		if (!root) {
			if (this.ContentPackages.length > 0) {
				logger.warn('No root for bundle: %s %o',
					this.getID(),
					this.ContentPackages.map(o => o.getID())
				);
			}
			return '';
		}

		return URL.join(root, 'presentation-assets', 'webapp', 'v1');
	}


	getDiscussions () {
		return this.fetchLinkParsed('DiscussionBoard')
			.then(board => board.getContents())
			.then(data => ({
				Other: {
					Section: {
						forums: data.Items
					}
				}
			}));
	}


	hasDiscussions () {
		return this.hasLink('DiscussionBoard');
	}


	getTablesOfContents () {

		return Promise.all(this.ContentPackages.map(p =>p.getTableOfContents()))

			.then(tables => new TablesOfContents.fromIterable(tables, this[Service], this));
	}


	getDefaultShareWithValue (preferences) {
		return preferences ? preferences.value : [];
	}


	getVideoIndex () {
		return Promise.all(this.map(pkg=>pkg.getVideoIndex()))
			.then(indices => MediaIndex.combine(indices));
	}
}
