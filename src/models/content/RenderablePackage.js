import Registry, { COMMON_PREFIX } from '../Registry.js';

import Package from './Package.js';

const RST_TYPE = 'text/x-rst';

export default class RenderablePackage extends Package {
	static MimeType = COMMON_PREFIX + 'renderablecontentpackage';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'description':          { type: 'string' },
		'LatestRenderJob':      { type: 'model'  },
		'LessonContainerCount': { type: 'number' },
		'isPublished':          { type: 'boolean'},
		'isRendered':           { type: 'boolean'},
		'isLocked':             { type: 'boolean'}
	}

	isRenderable = true;

	//no-op this for renderable packages, all the icons should
	//be set as properties for now
	setUpAssets() {}

	getRSTContents() {
		return this.fetchLink({ rel: 'contents', mode: 'raw' }).then(
			contents => {
				if (contents.contentType !== RST_TYPE) {
					throw new Error('Unexpected content type');
				}

				return contents;
			}
		);
	}

	setRSTContents(contents, prevVersion) {
		return this.putToLink('contents', {
			contentType: RST_TYPE,
			contents,
			version: prevVersion,
		})
			.then(updatedContentPackage => {
				const newContents = updatedContentPackage.contents;

				delete updatedContentPackage.contents;

				this.refresh(updatedContentPackage);

				return newContents;
			})
			.then(newContents => this.emit('contents-changed', newContents));
	}

	publish() {
		return this.postToLink('publish')
			.then(updatedContentPackage => this.refresh(updatedContentPackage))
			.then(() => this.onChange());
	}

	unpublish() {
		return this.postToLink('unpublish')
			.then(updatedContentPackage => this.refresh(updatedContentPackage))
			.then(() => this.onChange());
	}
}

Registry.register(RenderablePackage);
