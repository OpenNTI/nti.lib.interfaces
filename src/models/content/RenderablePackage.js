import Base from '../Base';

export default class RenderablePackage extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getContents () {
		return this.fetchLink('contents');
	}


	setContents (rst) {
		return this.putToLink('contents', rst);
	}
}
