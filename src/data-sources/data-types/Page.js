import {Service} from '../../constants';

import Batch from './Batch';

export default class Page extends Batch {
	static Fields = {
		...Batch.Fields,
		'PageSize':               {type: 'number'},
		'ItemCount':              {type: 'number'},
		'TotalItemCount':         {type: 'number'},
		'FilteredTotalItemCount': {type: 'number'}
	}

	get TotalPageCount () {
		const {TotalItemCount, PageSize} = this;

		return Math.ceil(TotalItemCount / PageSize);
	}

	get hasMore () {
		return this.hasLink('batch-next');
	}

	getItemCount () {
		return (this.Items || []).length;
	}

	getTotalItemCount () {
		return this.FilteredTotalItemCount != null ? this.FilteredTotalItemCount : this.TotalItemCount;
	}

	async loadNextPage () {
		const resp = await this.fetchLink('batch-next');

		return new Page(this[Service], this, {
			PageSize: this.PageSize,
			...resp
		});
	}
}
