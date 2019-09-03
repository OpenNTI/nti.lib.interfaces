import {URL} from '@nti/lib-commons';

import PagedDataSource from '../PagedDataSource';
import PageBatch from '../data-types/Page';

export default class PageLinkDataSource extends PagedDataSource {
	static forLink (service, parent, link, knownParams) {
		return new PageLinkDataSource(service, parent, knownParams, {link});
	}

	get link () {
		return (this.config || {}).link;
	}

	async requestPage (pageId, params) {
		const {link} = this.link;

		if (!link) { throw new Error('No link provided.'); }

		const contents = await this.service.get(URL.appendQueryParams(link, params));

		return new PageBatch(this.service, this.parent, {
			PageSize: params.batchSize,
			...contents
		});
	}
}