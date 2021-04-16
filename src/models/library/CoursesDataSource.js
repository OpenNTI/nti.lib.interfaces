import BaseDataSource from '../../data-sources/BaseDataSource.js';

const FAVORITES = 'favorites';

const defaultOptions = {
	batchSize: 12,
};

const sortOptions = [
	'availability',
	'provideruniqueid',
	// 'instructor',
	'lastSeenTime',
	'createdTime',
	// 'lastActivityTime',
	'title',
];

export class CoursesDataSource extends BaseDataSource {
	constructor(service, collectionName, options) {
		super(service);
		this.collection = service.getCollection(collectionName, 'Courses');
		this.options = {
			...defaultOptions,
			...options,
		};
	}

	static sortOptions = sortOptions;
	sortOptions = sortOptions;

	async request({
		batchSize = this.options.batchSize,
		batchStart = 0,
		filter,
		sortOn = FAVORITES,
		sortDirection,
		preprocessor,
	} = {}) {
		const useFavorites =
			!filter &&
			sortOn === FAVORITES &&
			this.collection.hasLink('Favorites');

		const link = useFavorites
			? this.collection.getLink('Favorites')
			: this.collection.href;

		const batch = await this.service.getBatch(
			link,
			useFavorites
				? null
				: {
						filter,
						sortOn,
						sortDirection,
						batchStart: 0,
						batchSize,
				  }
		);

		const { Items: items = [], Total: total } =
			(await preprocessor?.(batch, this.service)) || batch || {};

		return {
			items,
			total,
			sortOn,
			sortDirection,
			nextBatch: batch.getLink('batch-next'),
			hasMore: total > items.length,
		};
	}
}
