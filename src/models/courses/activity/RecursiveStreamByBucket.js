import { Parser as parse } from '../../../constants.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

const BY_MOST_RECENT = (a, b) => b.MostRecentTimestamp - a.MostRecentTimestamp;
const sorted = (_, stream, data) =>
	(stream[parse](data) || []).sort(BY_MOST_RECENT);

export default class RecursiveStreamByBucket extends Base {
	static MimeType =
		COMMON_PREFIX + 'courseware.courserecursivestreambybucket';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items':            { type: sorted,   defaultValue: [] },
		'TotalBucketCount': { type: 'number',                  },
	};

	[Symbol.iterator]() {
		let snapshot = this.Items.reduce(
			(agg, bin) => agg.concat(Array.from(bin)),
			[]
		);
		let { length } = snapshot;
		let index = 0;

		return {
			next() {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			},
		};
	}

	getMostRecentDate() {
		const [item] = this.Items;
		return item ? item.mostRecentDate : new Date(0);
	}

	getOldestDate() {
		const { Items: items } = this;
		const item = items[items.length - 1];
		return item ? item.oldestDate : new Date(0);
	}
}

Registry.register(RecursiveStreamByBucket);
