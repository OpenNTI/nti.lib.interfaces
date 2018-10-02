import { URL } from '@nti/lib-commons';

import PagedDataSource from '../../data-sources/PagedDataSource';
import PagedBatch from '../../data-sources/data-types/Page';

export default class ActivityStreamDataSource extends PagedDataSource {
	async requestPage (pageID, {batchSize = 10, ...params}) {
		const requestParams = {
			...params,
			batchStart: pageID * batchSize,
			batchSize
		};

		const link = this.parent.getLink('Activity');

		if (!link) { return Promise.reject('No Link'); }

		const activity = await this.service.get(URL.appendQueryParams(link, requestParams));

		return new PagedBatch(this.service, this.parent, {
			PageSize: batchSize,
			...activity
		});
	}
}
