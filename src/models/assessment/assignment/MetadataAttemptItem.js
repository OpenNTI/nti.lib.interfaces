import Base from '../../Base.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';

export default class MetadataAttemptItem extends Base {
	static MimeType =
		COMMON_PREFIX + 'assessment.userscourseassignmentattemptmetadataitem';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'StartTime': 	{ type: 'date' },
		'SubmitTime': 	{ type: 'date' },
		'Duration': 	{ type: 'any'  },
	}

	getDuration() {
		return this.Duration && this.Duration * 1000;
	}

	getHistoryItem() {
		if (!this.hasLink('HistoryItem')) {
			return Promise.resolve(null);
		}

		return this.fetchLink('HistoryItem');
	}
}

Registry.register(MetadataAttemptItem);
