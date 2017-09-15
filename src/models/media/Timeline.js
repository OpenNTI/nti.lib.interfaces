import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class Timeline extends Base {
	static MimeType = COMMON_PREFIX + 'ntitimeline'

	static Fields = {
		...Base.Fields,
		'description':      { type: 'string'  },
		'icon':             { type: 'string'  },
		'label':            { type: 'string'  },
		'suggested-inline': { type: 'boolean' },
	}

}
