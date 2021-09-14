import { url } from '@nti/lib-commons';

import PagedDataSource from '../../data-sources/PagedDataSource.js';
import PagedBatch from '../../data-sources/data-types/Page.js';
import { NO_LINK } from '../../constants.js';

export default class ActivityStreamDataSource extends PagedDataSource {
	async requestPage(pageID, { batchSize = 10, ...params }) {
		const requestParams = {
			...params,
			batchStart: pageID * batchSize,
			batchSize,
		};

		const link = this.parent.getLink('Activity');

		if (!link) {
			throw new Error(NO_LINK);
		}

		const activity = await this.service.get(
			url.appendQueryParams(link, requestParams)
		);

		return new PagedBatch(this.service, this.parent, {
			PageSize: batchSize,
			...activity,
		});
	}
}
