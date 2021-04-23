import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class SearchFragment extends Base {
	static MimeType = COMMON_PREFIX + 'search.searchfragment';

	// prettier-ignore
	static Fields = {
		'Matches': { type: 'string[]' },
		'Field':   { type: 'string'   },
	}
}

export default decorate(SearchFragment, [model]);
