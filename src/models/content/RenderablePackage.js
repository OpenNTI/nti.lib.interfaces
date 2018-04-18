import {ntiidEquals} from '@nti/lib-ntiids';

import {RepresentsSameObject} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';

import Package from './Package';

const RST_TYPE = 'text/x-rst';

export default
@model
class RenderablePackage extends Package {
	static MimeType = COMMON_PREFIX + 'renderablecontentpackage'

	static Fields = {
		...Package.Fields,
		'LatestRenderJob': { type: 'model' },
		'isPublished':     { type: 'boolean'},
		'isRendered':      { type: 'boolean'},
		'isLocked':        { type: 'boolean'}
	}

	isRenderable = true


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
			.then((updatedContentPackage) => {
				const newContents = updatedContentPackage.contents;

				delete updatedContentPackage.contents;

				this.refresh(updatedContentPackage);

				return newContents;
			})
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
