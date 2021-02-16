import Base from '../Base';

export default class BaseSiteInvitation extends Base {
	// prettier-ignore
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
