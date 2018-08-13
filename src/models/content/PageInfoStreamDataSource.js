import { URL } from '@nti/lib-commons';

import PagedDataSource from '../../data-sources/PagedDataSource';
import PagedBatch from '../../data-sources/data-types/Page';
import { Service } from '../../constants';

export default class PageInfoStreamDataSource extends PagedDataSource {
	constructor (service, parent) {
		super(service, parent);
	}

	async requestPage (pageID, params) {
		const pageInfo = this.parent;
		const batchSize = params.batchSize || 10;

		const requestParams = {
			...params,
			batchStart: pageID * batchSize,
			batchSize
		};

		let link = pageInfo.getLink('RecursiveUserGeneratedData');

		if (!link) {
			return Promise.reject('No Link.');
		}

		const requestLink = URL.appendQueryParams(link, requestParams);

		const contents = await this[Service].get(requestLink);

		return new PagedBatch(this[Service], this.parent, {
			PageSize: requestParams.batchSize,
			...contents
		});
	}
}
