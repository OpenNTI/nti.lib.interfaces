import Registry, {COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export class PersistentSubscription extends Base {
	static MimeType = COMMON_PREFIX + 'zapier.persistentsubscription';

	static Fields = {
		...super.Fields,
		'Id':      { type: 'string' },
		'OwnerId': { type: 'string' },
		'Status':  { type: 'string' },
	}

	isPersistentSubscription = true

	getID() {
		return this.Id; // doesn't have an NTIID
	}
}

Registry.register(PersistentSubscription);
Registry.alias(PersistentSubscription.MimeType, 'PersistentSubscription');
