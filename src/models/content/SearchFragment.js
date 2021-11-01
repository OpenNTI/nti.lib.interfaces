import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class SearchFragment extends Base {
	static MimeType = COMMON_PREFIX + 'search.searchfragment';

	// prettier-ignore
	static Fields = {
		'Matches': { type: 'string[]' },
		'Field':   { type: 'string'   },
	};
}

Registry.register(SearchFragment);
