import Base from '../../Base';
import {Parser as parse} from '../../../CommonSymbols';

export default class RecursiveStreamByBucket extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);

		if (!this.Items || Object.keys(this.Items).length === 0) {
			this.Items = [];
		}

		this[parse]('Items');

		//TotalBucketCount: 2,
	}

}
