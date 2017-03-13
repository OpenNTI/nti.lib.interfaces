import {ntiidEquals} from 'nti-lib-ntiids';

import {Parser as parse, RepresentsSameObject} from '../../constants';

import Package from './Package';

const RST_TYPE = 'text/x-rst';

export default class RenderablePackage extends Package {
	isRenderable = true

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('LatestRenderJob');
	}

	//no-op this for renderable packages, all the icons should
	//be set as properties for now
	setUpAssets () {}

	[RepresentsSameObject] (o) {
		return ntiidEquals(this.NTIID, o.NTIID, true) || ntiidEquals(this.OID, o.OID, true);
	}


	getRSTContents () {
		return this.fetchLink('contents')
			.then((contents) => {
				if (contents.contentType !== RST_TYPE) {
					throw new Error('Unexpected content type');
				}

				return contents;
			});
	}


	setRSTContents (contents, prevVersion) {
		return this.putToLink('contents', {
			contentType: RST_TYPE,
			contents,
			version: prevVersion
		})
			.then((updatedContentPackage) => this.refresh(updatedContentPackage))
			.then(() => this.getRSTContents())
			.then((newContents) => this.emit('contents-changed', newContents));
	}


	publish () {
		return this.postToLink('publish')
			.then((updatedContentPackage) => this.refresh(updatedContentPackage))
			.then(() => this.onChange());
	}


	unpublish () {
		return this.postToLink('unpublish')
			.then((updatedContentPackage) => this.refresh(updatedContentPackage))
			.then(() => this.onChange());
	}
}
