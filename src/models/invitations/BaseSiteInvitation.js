import Base from '../Base.js';

export default class BaseSiteInvitation extends Base {
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'original_receiver': {type: 'string', name: 'originalReceiver'},
		'receiver':     { type: 'string'  },
		'sender':       { type: 'string'  },
		'site':         { type: 'string'  },
		'accepted':     { type: 'boolean' },
		'code':         { type: 'string'  },
		'message':      { type: 'string'  },
		'expiryTime':   { type: 'date'    }
	};

	get expired() {
		const time = this.getExpiryTime();

		return time && time.getTime() !== 0;
	}
}
