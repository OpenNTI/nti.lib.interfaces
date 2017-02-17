import Base from '../Base';

const RST_TYPE = 'text/x-rst';

export default class RenderablePackage extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getRSTContents () {
		return this.fetchLink('contents');
	}


	setRSTContents (contents) {
		return this.putToLink('contents', {
			contentType: RST_TYPE,
			contents
		});
	}
}
