import Registry, { COMMON_PREFIX } from '../../Registry.js';

import BaseEvent from './BaseEvent.js';

export default class WebinarCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}webinar.webinarcalendarevent`;

	// prettier-ignore
	static Fields = {
		...BaseEvent.Fields
	}

	getUniqueIdentifier = () => {
		return this.href;
	};
}

Registry.register(WebinarCalendarEvent);
