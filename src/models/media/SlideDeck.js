import {mixin/*, readonly*/} from 'nti-lib-decorators';

import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
@mixin({/*@readonly*/ isSlideDeck: true})
class SlideDeck extends Base {
	static MimeType = COMMON_PREFIX + 'ntislidedeck'

	static Fields = {
		...Base.Fields,
		'byline': { type: 'string'  },
		'title':  { type: 'string'  },
		'Slides': { type: 'model[]' },
		'Videos': { type: 'model[]' },
	}
}
