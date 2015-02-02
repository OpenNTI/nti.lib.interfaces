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

		this.ContentPackages.map((v,i,a) => {
			let obj = a[i] = v = this[parse](v);
			obj.on('changed', this.onChange.bind(this));
		});

		this.addToPending(
			this.getAsset('landing').then(setAndEmit(this, 'icon')),
			this.getAsset('thumb').then(setAndEmit(this, 'thumb')),
			this.getAsset('background').then(setAndEmit(this, 'background'))
			);
	}

	getDefaultAssetRoot () {
		var root = ([this].concat(this.ContentPackages))
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


	getTablesOfContents () {

		return Promise.all(this.ContentPackages.map(p =>
			p.getTableOfContents().then(t => ({ id: p.getID(), toc: t }))))

			.then(tables => {
				var result = tables.slice();

				tables.forEach((v, i) =>
					result[v.id] = result[i] = v.toc);

				return new TablesOfContents(this[Service], this, result);
			});
	}
}
