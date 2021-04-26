import BaseDataSource from '../../data-sources/BaseDataSource.js';

const defaultOptions = {};

const sortOptions = [
	// 'title',
];

export class BooksDataSource extends BaseDataSource {
	constructor(service, collectionName, options) {
		super(service);
		this.collection = service.getCollection(
			'VisibleContentBundles',
			'ContentBundles'
		);
		this.options = {
			...defaultOptions,
			...options,
		};
	}

	static sortOptions = sortOptions;
	sortOptions = sortOptions;

	async request({ sortOn, sortDirection, batchSize, filter }) {
		return this.collection.fetchLink('self', {
			...defaultOptions,
			sortOn,
			sortDirection,
			batchSize,
			filter,
		});
	}
}
