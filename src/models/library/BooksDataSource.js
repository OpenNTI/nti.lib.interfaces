import BaseDataSource from '../../data-sources/BaseDataSource.js';
import { NotAvailableError } from '../../utils/errors.js';

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

	async request({ sortOn, sortOrder, batchSize, filter }) {
		if (!this.collection) {
			throw new NotAvailableError('Not Available');
		}
		return this.collection.fetchLink({
			mode: 'raw',
			rel: 'self',
			params: {
				...defaultOptions,
				sortOn,
				sortOrder,
				batchSize,
				filter,
			},
		});
	}
}
