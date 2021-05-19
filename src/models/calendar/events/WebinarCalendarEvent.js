import Registry, { COMMON_PREFIX } from '../../Registry.js';

import { BaseEvent } from './BaseEvent.js';

export class WebinarCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}webinar.webinarcalendarevent`;

	getUniqueIdentifier = () => {
		return this.href;
	};
}

Registry.register(WebinarCalendarEvent);
