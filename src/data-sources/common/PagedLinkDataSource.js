import { URL } from '@nti/lib-commons';

import PagedDataSource from '../PagedDataSource.js';
import PageBatch from '../data-types/Page.js';

export default class PageLinkDataSource extends PagedDataSource {
	static forLink(service, parent, link, knownParams) {
		return new PageLinkDataSource(service, parent, knownParams, { link });
	}

	get link() {
		return (this.config || {}).link;
	}

	async requestPage(pageId, params) {
		const { link } = this;

		if (!link) {
			throw new Error('No link provided.');
		}

		const requestParams = {
			...params,
		};

		if (requestParams.batchSize != null) {
			requestParams.batchStart = pageId * requestParams.batchSize;
		}

		const contents = await this.service.get(
			URL.appendQueryParams(link, requestParams)
		);

		return new PageBatch(this.service, this.parent, {
			PageSize: requestParams.batchSize,
			...contents,
		});
	}
}
