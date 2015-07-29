import ProfileEvent from './ProfileEvent';
import {PROFILE_ACTIVITY_VIEWED as mimeType} from './MimeTypes';

export default class ProfileViewedEvent extends ProfileEvent {
	constructor (profileEntity) {
		super(mimeType, profileEntity, Date.now());
	}
}
