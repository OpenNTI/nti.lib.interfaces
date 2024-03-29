import path from 'path';

import { url } from '@nti/lib-commons';

import PagedDataSource from '../../data-sources/PagedDataSource.js';
import PagedBatch from '../../data-sources/data-types/Page.js';

export default class BundleSearchDataSource extends PagedDataSource {
	async requestPage(page, params) {
		const batchSize = params.batchSize || 10;
		const { term, ...others } = params;

		const rootPackage = this.parent.ContentPackages[0];

		if (!rootPackage) {
			throw new Error('No Content Package to Search');
		}

		const requestParams = {
			...others,
			batchStart: page * batchSize,
			batchSize,
			sortOn: 'relevance',
		};

		const href = path.join(
			this.service.getUserUnifiedSearchURL(),
			encodeURIComponent(rootPackage.NTIID),
			encodeURIComponent(term)
		);

		const contents = await this.service.get(
			url.appendQueryParams(href, requestParams)
		);

		return new PagedBatch(this.service, this.parent, {
			PageSize: batchSize,
			...contents,
		});
	}
}
