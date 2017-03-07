import {ntiidEquals} from 'nti-lib-ntiids';

import Package from './Package';
import {Parser as parse, RepresentsSameObject} from '../../constants';

const RST_TYPE = 'text/x-rst';

export default class RenderablePackage extends Package {
	isRenderable = true

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('LatestRenderJob');
	}


	[RepresentsSameObject] (o) {
		return ntiidEquals(this.NTIID, o.NTIID, true) || ntiidEquals(this.OID, o.OID, true);
	}


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


	publish () {
		return this.postToLink('publish')
			.then((updatedContentPackage) => this.refresh(updatedContentPackage))
			.then(() => this[parse]('LatestRenderJob'))
			.then(() => this.onChange());
	}


	unpublish () {
		return this.postToLink('unpublish')
			.then((updatedContentPackage) => this.refresh(updatedContentPackage))
			.then(() => this[parse]('LatestRenderJob'))
			.then(() => this.onChange());
	}
}
