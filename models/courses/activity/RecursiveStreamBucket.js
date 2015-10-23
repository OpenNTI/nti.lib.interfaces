import Base from '../../Base';
import {threadThreadables} from '../../../utils/UserDataThreader';
import {Parser as parse} from '../../../CommonSymbols';

export default class RecursiveStreamBucket extends Base {

	constructor (service, parent, data) {
		super(service, parent, data);
		const thread = x => {
			this[parse](x);
			this[x] = threadThreadables(this[x]);
		};

		thread('Items');

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

	[Symbol.iterator] () {
		let snapshot = this.Items.slice();
		let {length} = snapshot;
		let index = 0;

		return {

			next () {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			}

		};
	}


	map (fn) {
		return Array.from(this).map(fn);
	}
}
