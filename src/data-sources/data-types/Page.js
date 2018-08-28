import Batch from './Batch';

export default class Page extends Batch {
	static Fields = {
		...Batch.Fields,
		'PageSize':               {type: 'number'},
		'TotalItemCount':         {type: 'number'},
		'FilteredTotalItemCount': {type: 'number'}
	}

	get TotalPageCount () {
		const {TotalItemCount, PageSize} = this;

		return Math.ceil(TotalItemCount / PageSize);
	}

	getItemCount () {
		return (this.Items || []).length;
	}

	getTotalItemCount () {
		return this.FilteredTotalItemCount != null ? this.FilteredTotalItemCount : this.TotalItemCount;
	}
}
