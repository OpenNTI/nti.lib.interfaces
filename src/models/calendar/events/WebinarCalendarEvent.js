import { model, COMMON_PREFIX } from '../../Registry';

import BaseEvent from './BaseEvent';

export default
@model
class WebinarCalendarEvent extends BaseEvent {
	static MimeType = `${COMMON_PREFIX}webinar.webinarcalendarevent`

	static Fields = {
		...BaseEvent.Fields
	}

	getUniqueIdentifier = () => {
		return this.href;
	}
}
