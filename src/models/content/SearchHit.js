import {decorate} from '@nti/lib-commons';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

class ContentUnitSearchHit extends Base {
	static MimeType = [
		COMMON_PREFIX + 'search.contentunitsearchhit',
		COMMON_PREFIX + 'search.searchhit',
		COMMON_PREFIX + 'search.ugdsearchhit',
		COMMON_PREFIX + 'search.transcriptsearchhit'
	]

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

export default decorate(ContentUnitSearchHit, {with:[model]});
