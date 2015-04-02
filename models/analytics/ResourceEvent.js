import BasicEvent from './Base';
import {RESOURCE_VIEWED} from './MimeTypes';

export default class ResourceEvent extends BasicEvent {
	constructor (resourceId, courseId) {
		super(RESOURCE_VIEWED, courseId);
		Object.assign(this, {
			resource_id: resourceId // eslint-disable-line camelcase
		});
	}
}
