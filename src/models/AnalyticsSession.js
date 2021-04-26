import Registry, { COMMON_PREFIX } from './Registry.js';
import Base from './Base.js';

export default class AnalyticsSession extends Base {
	static MimeType = COMMON_PREFIX + 'analytics.analyticssession';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'SessionStartTime':     { type: 'date' },
		'SessionEndTime':       { type: 'date' },
		'GeographicalLocation': { type: 'object' },
		'UserAgent':            { type: 'string' },
		'Username':             { type: 'string' },
		'SessionID':            { type: 'number' }
	}

	getSessionStartTime() {} //implemented by SessionStartTime date field.
	getSessionEndTime() {} //implemented by SessionEndTime date field.
}

Registry.register(AnalyticsSession);
