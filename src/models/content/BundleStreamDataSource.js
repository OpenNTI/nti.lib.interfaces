import { URL } from '@nti/lib-commons';

import PagedDataSource from '../../data-sources/PagedDataSource';
import PagedBatch from '../../data-sources/data-types/Page';
import { NO_LINK } from '../../constants';

export default class BundleStreamDataSource extends PagedDataSource {
	loadRootPage() {
		const { parent, cachedLoadRootPage } = this;

		if (cachedLoadRootPage) {
			return cachedLoadRootPage;
		}

		const rootPageNTIID = parent.ContentPackages[0].NTIID;

		this.cachedLoadRootPage = this.service.getPageInfo(
			rootPageNTIID,
			null,
			null,
			null,
			parent
		);

		return this.cachedLoadRootPage;
	}

	async requestPage(pageID, params) {
		const rootPage = await this.loadRootPage();
		const batchSize = params.batchSize || 10;

		const requestParams = {
			...params,
			batchStart: pageID * batchSize,
			batchSize,
		};

		const link = rootPage.getLink('RecursiveUserGeneratedData');

		if (!link) {
			throw new Error(NO_LINK);
		}

		const contents = await this.service.get(
			URL.appendQueryParams(link, requestParams)
		);

		return new PagedBatch(this.service, this.parent, {
			PageSize: batchSize,
			...contents,
		});
	}
}
