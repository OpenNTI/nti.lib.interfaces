import path from 'path';

import { URL } from '@nti/lib-commons';

import PagedDataSource from '../../data-sources/PagedDataSource';
import PagedBatch from '../../data-sources/data-types/Page';

export default class BundleSearchDataSource extends PagedDataSource {
	async requestPage (page, params) {
		const batchSize = params.batchSize || 10;
		const {term, ...others} = params;

		const rootPackage = this.parent.ContentPackages[0];

		if (!rootPackage) {
			throw new Error('No Content Package to Search');
		}

		const requestParams = {
			...others,
			batchStart: page * batchSize,
			batchSize,
			sortOn: 'relevance'
		};

		const href = path.join(this.service.getUserUnifiedSearchURL(), encodeURI(rootPackage.NTIID), encodeURI(term));

		const contents = await this.service.get(URL.appendQueryParams(href, requestParams));

		return new PagedBatch(this.service, this.parent, {
			PageSize: batchSize,
			...contents
		});
	}
}
