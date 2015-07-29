import BasicEvent from './Base';
import {PROFILE_VIEWED} from './MimeTypes';

export default class ProfileEvent extends BasicEvent {
	constructor (mimeType, profileEntity, startTime = Date.now()) {
		super(mimeType, null, null, startTime);
		Object.assign(this, {
			ProfileEntity: profileEntity
		});
	}
}
