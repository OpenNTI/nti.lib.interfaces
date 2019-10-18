import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class ContentUnitSearchHit extends Base {
	static MimeType = COMMON_PREFIX + 'search.contentunitsearchhit'

	static Fields = {
		...Base.Fields,
		'Class':          { type: 'string'   },
		'Containers':     { type: 'string[]' },
		'ContainerTitle': { type: 'string'   },
		'Fragments':      { type: 'model[]'  },
		'Score':          { type: 'number'   },
		'TargetMimeType': { type: 'string'   }
	}

	isContentUnitSearchHit = true
}