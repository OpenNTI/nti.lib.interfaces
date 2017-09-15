import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentMetadataItem extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmentmetadataitem'

	static Fields = {
		...Base.Fields,
		'Duration':          { type: 'number', name: 'duration' }, //seconds
		'StartTime':         { type: 'date'                     },
		'CatalogEntryNTIID': { type: 'string'                   },
	}


	getStartTime () {} //implemented by StartTime date field


	//for symmetry, define a 'getDuration'
	getDuration () {
		return this.duration;
	}
}
