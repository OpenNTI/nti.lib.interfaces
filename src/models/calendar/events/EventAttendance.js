import Batch from '../../../data-sources/data-types/Batch.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';

export class EventAttendance extends Batch {
	static ChangeBubbles = true;
	static MimeType = COMMON_PREFIX + 'calendar.calendareventattendance';
}

Registry.register(EventAttendance);
