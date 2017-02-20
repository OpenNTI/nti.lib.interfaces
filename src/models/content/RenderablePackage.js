import Base from '../Base';

const RST_TYPE = 'text/x-rst';

export default class RenderablePackage extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
	}

	isRenderable = true

	getRSTContents () {
		return this.fetchLink('contents')
			.then((contents) => {
				if (contents.contentType !== RST_TYPE) {
					throw new Error('Unexpected content type');
				}

				return contents.data;
			});
	}


	setRSTContents (contents) {
		return this.putToLink('contents', {
			contentType: RST_TYPE,
			contents
		});
	}
}