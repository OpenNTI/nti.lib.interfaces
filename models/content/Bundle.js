import Base from '../Base';
import {
	Service,
	Parser as parse
} from '../../CommonSymbols';

import setAndEmit from '../../utils/getsethandler';
import urlJoin from '../../utils/urljoin';

import forwardFunctions from '../../utils/function-forwarding';

import assets from '../mixins/PresentationResources';

import TablesOfContents from '../TablesOfContents';

export default class Bundle extends Base {
	constructor (service, parent, data) {
		super(service, parent, data,
			{isBundle: true},
			assets,
			forwardFunctions(
				[
					'every',
					'filter',
					'forEach',
					'map',
					'reduce'
				],
				'ContentPackages'));

		this.author = (data.DCCreator || []).join(', ');

		this.ContentPackages = (data.ContentPackages || []).map(v => {
			let obj = this[parse](v);
			obj.on('changed', this.onChange.bind(this));
			return obj;
		});

		this.addToPending(
			this.getAsset('landing').then(setAndEmit(this, 'icon')),
			this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
			this.getAsset('background').then(setAndEmit(this, 'background'))
			);
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
		let root = ([this].concat(this.ContentPackages))
				.reduce((agg, o) => agg || o.root, null);

		if (!root) {
			console.error('No root for bundle: ',
				this.getID(),
				this.ContentPackages.map(o => o.getID())
				);
			return '';
		}

		return urlJoin(root, 'presentation-assets', 'webapp', 'v1');
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


	getPublicScope () {
		return [];
	}
}
