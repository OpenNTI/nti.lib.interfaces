import {Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

@model
export default class RecursiveStreamByBucket extends Base {
	static MimeType = COMMON_PREFIX + 'courseware.courserecursivestreambybucket'

	constructor (service, parent, data) {
		super(service, parent, data);

		if (!this.Items || Object.keys(this.Items).length === 0) {
			this.Items = [];
		}

		this[parse]('Items', []);
		//Newest first
		this.Items.sort((a, b) => b.MostRecentTimestamp - a.MostRecentTimestamp);

		//TotalBucketCount: 2,
	}

	[Symbol.iterator] () {
		let snapshot = this.Items.reduce((agg, bin) => agg.concat(Array.from(bin)), []);
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


	getMostRecentDate () {
		const [item] = this.Items;
		return item ? item.mostRecentDate : new Date(0);
	}

	getOldestDate () {
		const {Items: items} = this;
		const item = items[items.length - 1];
		return item ? item.oldestDate : new Date(0);
	}

}
