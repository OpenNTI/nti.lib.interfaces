import Base from '../../models/Base';

export default class Batch extends Base {
	static Fields = {
		'BatchPage':              {type: 'number'                   },
		'Items':                  {type: 'model[]', defaultValue: []},
		'Name':                   {type: 'string'                   },
		'Total':                  {type: 'number'                   }
	}


	constructor (service, parent, data) {
		super(service, parent, data);

		this.addToPending(
			Promise.all(
				this.Items.map(item => item.waitForPending ? item.waitForPending() : item)
			)
		);
	}
}
