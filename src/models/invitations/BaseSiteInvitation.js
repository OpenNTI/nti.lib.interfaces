import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class BaseSiteInvitation extends Base {
	static MimeType = COMMON_PREFIX + 'siteinvitation'

	static Fields = {
		...Base.Fields,
		'receiver':     { type: 'string'  },
		'sender':       { type: 'string'  },
		'site':         { type: 'string'  },
		'accepted':     { type: 'boolean' },
		'code':         { type: 'string'  },
		'message':      { type: 'string'  },
		'expiryTime':   { type: 'date'    }
	}

}
