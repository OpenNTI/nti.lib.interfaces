import Registry, {COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export class PersistentSubscription extends Base {
	static MimeType = COMMON_PREFIX + 'zapier.persistentsubscription';

	static Fields = {
		'OwnerId':   { type: 'string' },
	}
}

Registry.register(PersistentSubscription);
Registry.alias(PersistentSubscription.MimeType, 'PersistentSubscription');
