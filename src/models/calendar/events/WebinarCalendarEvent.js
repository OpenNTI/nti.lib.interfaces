import { decorate } from '@nti/lib-commons';

import { model, COMMON_PREFIX } from '../../Registry';

import BaseEvent from './BaseEvent';

class WebinarCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}webinar.webinarcalendarevent`;

	// prettier-ignore
	static Fields = {
		...BaseEvent.Fields
	}

	getUniqueIdentifier = () => {
		return this.href;
	};
}

export default decorate(WebinarCalendarEvent, { with: [model] });
