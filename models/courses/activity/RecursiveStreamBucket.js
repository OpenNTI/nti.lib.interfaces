import Base from '../../Base';
import {Parser as parse} from '../../../CommonSymbols';

export default class RecursiveStreamBucket extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Items');

		// "BatchPage": 1,
		// "BucketItemCount": 1,
		// "ItemCount": 1,
	}

	get mostRecentDate () {
		return new Date(this.MostRecentTimestamp * 1000);
	}

	get oldestDate () {
		return new Date(this.OldestTimestamp * 1000);
	}
}
