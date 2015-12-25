import Base from '../Base';

const TakeOver = Symbol.for('TakeOver');
export default class RoomInfo extends Base {
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
