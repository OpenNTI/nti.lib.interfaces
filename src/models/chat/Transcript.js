import Base from '../Base';

import { Parser as parse } from '../../constants';

import {thread} from '../../utils/UserDataThreader';

const TakeOver = Symbol.for('TakeOver');

export default class Transcript extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);

		const rename = (x, y) => this[TakeOver](x, y);

		this[parse]('Messages');
		this[parse]('RoomInfo');

		rename('Contributors', 'contributors');

		if (this.Messages) {
			this.Messages = thread(this.Messages);
			this.Messages.sort((a, b) => a.getCreatedTime() - b.getCreatedTime());

			rename('Messages', 'messages');
		}
	}

	get startTime () {
		return this.RoomInfo.getCreatedTime();
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
