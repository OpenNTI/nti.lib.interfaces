import Base from '../../Base';
import { model, COMMON_PREFIX } from '../../Registry';

export default
@model
class MetadataAttemptItem extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmentattemptmetadataitem';

	static Fields = {
		'StartTime': 	{ type: 'date' },
		'SubmitTime': 	{ type: 'date' },
		'Duration': 	{ type: 'any'  },
	}
}
