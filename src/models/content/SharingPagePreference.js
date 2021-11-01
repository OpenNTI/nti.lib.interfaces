import { Service } from '../../constants.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class SharingPagePreference extends Base {
	static MimeType = COMMON_PREFIX + 'sharingpagepreference';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Provenance': { type: 'string', name: 'provenance' },
		'State':      { type: 'string', name: 'state'      },
		'sharedWith': { type: '*[]',    name: 'value'      },
	};

	//For the sake of bandwidth, and data...etc... lets not pre-resolve these.
	//Lets wait until the user actually invokes a note editior.
	resolveValueToEntities() {
		//prevent re-entry
		this.resolveValueToEntities = () => this.waitForPending();

		let resolving = this.value.map(v =>
			typeof v !== 'string'
				? v
				: this[Service].resolveEntity(v).catch(() => v)
		);

		Promise.all(resolving).then(v => Object.assign(this.value, v));

		return this.addToPending(...resolving).waitForPending();
	}
}

Registry.register(SharingPagePreference);
