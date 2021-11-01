import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class ContentUnitSearchHit extends Base {
	static MimeType = [
		COMMON_PREFIX + 'search.contentunitsearchhit',
		COMMON_PREFIX + 'search.searchhit',
		COMMON_PREFIX + 'search.ugdsearchhit',
		COMMON_PREFIX + 'search.transcriptsearchhit',
	];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Class':          { type: 'string'   },
		'Containers':     { type: 'string[]' },
		'ContainerTitle': { type: 'string'   },
		'Fragments':      { type: 'model[]'  },
		'Score':          { type: 'number'   },
		'TargetMimeType': { type: 'string'   }
	};

	isContentUnitSearchHit = true;
}

Registry.register(ContentUnitSearchHit);
