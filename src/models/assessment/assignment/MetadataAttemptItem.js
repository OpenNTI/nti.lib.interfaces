import {decorate} from '@nti/lib-commons';

import Base from '../../Base';
import { model, COMMON_PREFIX } from '../../Registry';

class MetadataAttemptItem extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmentattemptmetadataitem';

	static Fields = {
		...Base.Fields,
		'StartTime': 	{ type: 'date' },
		'SubmitTime': 	{ type: 'date' },
		'Duration': 	{ type: 'any'  },
	}

	getDuration () {
		return this.Duration && (this.Duration * 1000);
	}

	getHistoryItem () {
		if (!this.hasLink('HistoryItem')) { return Promise.resolve(null); }

		return this.fetchLinkParsed('HistoryItem');
	}
}

export default decorate(MetadataAttemptItem, {with:[model]});
