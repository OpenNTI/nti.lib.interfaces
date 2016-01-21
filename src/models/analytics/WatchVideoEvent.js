import BasicEvent from './Base';
import {WATCH_VIDEO} from './MimeTypes';
import {isNTIID} from 'nti-lib-ntiids';

export default class WatchVideoEvent extends BasicEvent {

	constructor (resourceId, courseId, context, videoStartTime, maxDuration, hasTranscript) {
		super(WATCH_VIDEO, courseId, (context || []).find(elem => isNTIID(elem)) || null);
		Object.assign(this, {
			MaxDuration: maxDuration,
			/*eslint-disable camelcase */
			resource_id: resourceId,
			context_path: context,
			video_start_time: videoStartTime,
			with_transcript: !!hasTranscript
			/*eslint-enable camelcase */
		});
	}

	finish (videoEndTime, eventEndTime = Date.now()) {
		super.finish(eventEndTime);
		// if this event is being halted (analytics store can do this on beforeunload, etc.)
		// we won't have a videoEndTime. best-guess it based on the duration (time_length) of this event.
		this.video_end_time = videoEndTime || this.video_start_time + this.time_length; // eslint-disable-line camelcase
	}
}
