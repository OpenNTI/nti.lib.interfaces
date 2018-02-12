import Batch from './Batch';

export default class Page extends Batch {
	static Field = {
		...Batch.fields,
		PageSize: {type: 'number'}
	}


	get TotalPageCount () {
		const {TotalItemCount, PageSize} = this;

		return Math.ceil(TotalItemCount / PageSize);
	}
}
