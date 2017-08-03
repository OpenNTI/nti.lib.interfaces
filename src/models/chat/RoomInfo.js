import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');

export default
@model
class RoomInfo extends Base {
	static MimeType = COMMON_PREFIX + '_meeting'

	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		rename('Active', 'isActive');
		rename('MessageCount', 'messageCount');
		rename('Moderated', 'isModerated');
		rename('Moderators', 'moderators');
		rename('Occupants', 'occupants');
	}
}
