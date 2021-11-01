import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export class EventUserSearchHit extends Base {
	static MimeType = `${COMMON_PREFIX}calendar.eventusersearchhit`;

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'User': { type: 'model' }
	};
}

Registry.register(EventUserSearchHit);
