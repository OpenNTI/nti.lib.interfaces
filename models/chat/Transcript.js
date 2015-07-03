import Base from '../Base';

import { Parser as parse } from '../../CommonSymbols';

const TakeOver = Symbol.for('TakeOver');

export default class Transcript extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		this[parse]('Messages');
		this[parse]('RoomInfo');

		rename('Contributors', 'contributors');

		if (this.Messages) {
			rename('Messages', 'messages');
		}
	}


	get messageCount () {
		return this.RoomInfo.messageCount;
	}


	get originator () {
		let ri = this.RoomInfo;
		return (ri || this).creator;
	}


	get contributorsWithoutOriginator () {
		let {contributors, originator} = this;
		return contributors.filter( x => x !== originator);
	}
}
