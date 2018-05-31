import Base from '../Base';
import {model, COMMON_PREFIX} from '../Registry';


export default
@model
class PresenceInfo extends Base {
	static MimeType = COMMON_PREFIX + 'presenceinfo'

	static Fields = {
		...Base.Fields,
		'username': {type: 'string'},
		'type': {type: 'string'},
		'show': {type: 'string'},
		'status': {type: 'string'}
	}

	isOnline () {
		return this.type !== 'unavailable';
	}

	getName () {
		const {show} = this;

		if (!this.isOnline()) {
			return 'unavailable';
		}

		if (show === 'chat') {
			return 'available';
		}

		if (show === 'xa') {
			return 'invisible';
		}

		return show;
	}
}
