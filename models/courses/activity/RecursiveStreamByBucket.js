import Base from '../../Base';
import {Parser as parse} from '../../../CommonSymbols';

export default class RecursiveStreamByBucket extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);

		if (!this.Items || Object.keys(this.Items).length === 0) {
			this.Items = [];
		}

		this[parse]('Items');

		if (this.Items) {
			//Newest first
			this.Items.sort((a, b) => b.MostRecentTimestamp - a.MostRecentTimestamp);
		}

		//TotalBucketCount: 2,
	}

	getMostRecentDate () {
		const [item] = this.Items;
		return item ? item.mostRecentDate : new Date(0);
	}

}
