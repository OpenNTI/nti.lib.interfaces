import { threadThreadables } from '../../../utils/UserDataThreader.js';
import { Parser as parse } from '../../../constants.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';

const thread = (_, bucket, data) => threadThreadables(bucket[parse](data));

export default class RecursiveStreamBucket extends Base {
	static MimeType = COMMON_PREFIX + 'courseware.courserecursivestreambucket';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'BatchItemCount':      { type: 'number'                  },
		'BatchPage':           { type: 'number'                  },
		'ItemCount':           { type: 'number'                  },
		'Items':               { type: thread,  defaultValue: [] },
		'MostRecentTimestamp': { type: 'number'                  },
		'OldestTimestamp':     { type: 'number'                  },
	};

	get mostRecentDate() {
		return new Date(this.MostRecentTimestamp * 1000);
	}

	get oldestDate() {
		return new Date(this.OldestTimestamp * 1000);
	}

	[Symbol.iterator]() {
		let snapshot = this.Items.slice();
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

	map(fn) {
		return Array.from(this).map(fn);
	}
}

Registry.register(RecursiveStreamBucket);
