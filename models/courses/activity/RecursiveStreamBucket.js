import Base from '../../Base';
import {DateFields, Parser as parse} from '../../../CommonSymbols';

export default class RecursiveStreamBucket extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		this[parse]('Items');

		// "BatchPage": 1,
		// "BucketItemCount": 1,
		// "ItemCount": 1,
	}


	[DateFields] () {
		return super[DateFields]().concat([
			'MostRecentTimestamp',
			'OldestTimestamp'
		]);
	}

}
