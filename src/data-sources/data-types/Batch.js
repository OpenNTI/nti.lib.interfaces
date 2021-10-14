import { Service } from '../../constants.js';
import Base from '../../models/Base.js';
import Registry from '../../models/Registry.js';

const next = 'batch-next';
export default class Batch extends Base {
	static MimeType = 'internal-batch-wrapper';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'BatchPage':              {type: 'number'                   },
		'Items':                  {type: 'model[]', defaultValue: []},
		'ItemCount':              {type: 'number'                   },
		'Name':                   {type: 'string'                   },
		'Total':                  {type: 'number'                   },
		'TotalItemCount':         {type: 'number'                   },
		'FilteredTotalItemCount': {type: 'number'                   }
	}

	static async from(parent, data) {
		return new Batch(parent[Service], parent, await data).waitForPending();
	}

	/**
	 * @param {Base[]} list
	 * @param {Base?} parent
	 * @returns {Batch}
	 */
	static fromList(list, parent) {
		const service = (parent || list?.[0])?.[Service];
		const batch = new Batch(service, parent, {
			BatchPage: 1,
			pageSize: list.length,
			Total: list.length,
			TotalItemCount: list.length,
			Items: [],
		});

		//list is already parsed, do no pass it to the constructor
		batch.Items = list;

		return batch;
	}

	constructor(service, parent, data) {
		super(service, parent, data);

		this.addToPending(
			Promise.all(
				this.Items.map(item => item?.waitForPending?.() || item)
			)
		);
	}

	[Symbol.iterator]() {
		return this.Items[Symbol.iterator]();
	}

	get count() {
		return this.Items?.length;
	}

	/** @type {number} */
	get currentPage() {
		return this.BatchPage;
	}

	get pageCount() {
		return Math.ceil(this.totalInContext / this.pageSize);
	}

	get pageSize() {
		for (let rel of ['self', 'next', 'prev']) {
			rel = this.getLink(rel)?.split('?');
			rel = rel?.[1] ?? rel?.[0];
			const batchSize = new URLSearchParams(rel).get('batchSize');
			if (batchSize != null) {
				return parseInt(batchSize, 10);
			}
		}
		return this.count;
	}

	/** @type {number} */
	get totalInContext() {
		return this.FilteredTotalItemCount ?? this.total;
	}

	/** @type {number} */
	get total() {
		return this.Total ?? this.TotalItemCount ?? 0;
	}

	/** @type {number} */
	get filteredTotal() {
		return this.FilteredTotalItemCount ?? 0;
	}

	get empty() {
		return (
			this.Items.length === 0 &&
			(this.total === 0 || this.filteredTotal === 0)
		);
	}

	get hasMore() {
		return this.hasLink(next) && this.Items?.length < this.total;
	}

	async next() {
		if (!this.hasMore) {
			return;
		}
		return this.fetchLink({ rel: 'batch-next', mode: 'batch' });
	}

	async appendNext() {
		if (!this.hasMore) {
			return;
		}

		// TODO: update fields
		const batch = await this.fetchLink({ rel: next, mode: 'batch' });
		this.Links = [
			...this.Links.filter(x => x.rel !== next),
			...batch.Links.filter(x => x.rel === next),
		];

		for (const item of batch.Items) {
			item.reparent(this);
			this.Items.push(item);
		}
	}

	async loadAll() {
		while (this.hasMore) {
			await this.appendNext();
		}

		return this;
	}
}

Registry.register(Batch);
