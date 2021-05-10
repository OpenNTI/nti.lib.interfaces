import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class AssignmentMetadataItem extends Base {
	static MimeType =
		COMMON_PREFIX + 'assessment.userscourseassignmentmetadataitem';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Duration':          { type: 'number', name: 'duration' }, //seconds
		'StartTime':         { type: 'date'                     },
		'CatalogEntryNTIID': { type: 'string'                   },
	}

	getStartTime() {} //implemented by StartTime date field

	//for symmetry, define a 'getDuration'
	getDuration() {
		return this.duration;
	}
}

Registry.register(AssignmentMetadataItem);
