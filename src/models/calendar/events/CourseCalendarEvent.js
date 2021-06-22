import Completable from '../../../mixins/Completable.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';

import { BaseEvent } from './BaseEvent.js';

export class CourseCalendarEvent extends Completable(BaseEvent) {
	static MimeType = `${COMMON_PREFIX}courseware.coursecalendarevent`;
}

Registry.register(CourseCalendarEvent);
