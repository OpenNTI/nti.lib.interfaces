import Base from '../../models/Base.js';

export default class Batch extends Base {
	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'BatchPage':              {type: 'number'                   },
		'Items':                  {type: 'model[]', defaultValue: []},
		'ItemCount':              {type: 'number'                   },
		'Name':                   {type: 'string'                   },
		'Total':                  {type: 'number'                   },
		'TotalItemCount':         {type: 'number'                   },
		'FilteredTotalItemCount': {type: 'number'                   }
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
}
