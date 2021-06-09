import { Service } from '../../constants.js';
import Base from '../../models/Base.js';

const next = 'batch-next';
export default class Batch extends Base {
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

	get empty() {
		return (
			this.Items.length === 0 &&
			(this.ItemCount === 0 ||
				this.Total === 0 ||
				this.TotalItemCount === 0 ||
				this.FilteredTotalItemCount === 0)
		);
	}

	get hasMore() {
		return this.hasLink(next);
	}

	async next() {
		if (!this.hasMore) {
			return;
		}

		const batch = await Batch.from(this, this.fetchLink(next));
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
			await this.next();
		}

		return this;
	}
}
