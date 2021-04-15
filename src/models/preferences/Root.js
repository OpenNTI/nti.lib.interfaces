import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

class PreferenceRoot extends Base {
	static MimeType = COMMON_PREFIX + 'preference.root';
	static ChangeBubbles = true;

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'ChatPresence':      { type: 'model' },
		'Gradebook':         { type: 'model' },
		'PushNotifications': { type: 'model' },
		'WebApp':            { type: 'model' },
	}

	constructor(service, parent, data) {
		super(service, parent, data);
		this.on('change', this.maybeSave);
	}

	maybeSave = () => {
		console.log('Something changed!');
	};
}

export default decorate(PreferenceRoot, { with: [model] });
