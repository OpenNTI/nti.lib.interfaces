import { URL } from '@nti/lib-commons';

import PagedDataSource from '../../data-sources/PagedDataSource.js';
import PagedBatch from '../../data-sources/data-types/Page.js';
import { NO_LINK } from '../../constants.js';

async function loadRootPage (parent, service) {
	const contentPackages = await parent.getContentPackages();
	const rootPageNTIID = contentPackages[0].NTIID;

	return service.getPageInfo(
		rootPageNTIID,
		null,
		null,
		null,
		parent
	);
}

export default class BundleStreamDataSource extends PagedDataSource {
	loadRootPage() {
		const { parent, service } = this;

		if (!this.cachedLoadRootPage) {
			this.cachedLoadRootPage = loadRootPage(parent, service);
		}

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
