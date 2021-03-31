import { URL } from '@nti/lib-commons';

import PagedDataSource from '../../../data-sources/PagedDataSource.js';
import PagedBatch from '../../../data-sources/data-types/Page.js';

export default class CourseAllActivityDataSource extends PagedDataSource {
	async requestPage(pageId, params) {
		const { link } = this.config || {};

		if (!link) {
			throw new Error('No All Activity Link');
		}

		const batchSize = params?.batchSize || 10;

		const requestParams = {
			...params,
			batchStart: pageId * batchSize,
			batchSize,
		};

		const contents = await this.service.get(
			URL.appendQueryParams(link, requestParams)
		);

		return new PagedBatch(this.service, this.parent, {
			PageSize: requestParams.batchSize,
			...contents,
		});
	}
}
