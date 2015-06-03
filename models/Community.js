import User from './User';

export default class Community extends User {
	constructor(service, data) {
		super(service, data);
		this.isCommunity = true;
	}
}
