import BasicEvent from './Base';
import {TOPIC_VIEWED} from './MimeTypes';

export default class TopicViewedEvent extends BasicEvent {
	constructor (topicId, courseId, startTime = Date.now()) {
		super(TOPIC_VIEWED, courseId, null, startTime);
		Object.assign(this, {
			topic_id: topicId // eslint-disable-line camelcase
		});
	}
}
