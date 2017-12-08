import Base from './Base';

export default class Batch extends Base {

	static Fields = {
		...Base.Fields,
		'Items': { type: 'model[]', defaultValue: [] },
		'Total': { type: 'number'                    }
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
