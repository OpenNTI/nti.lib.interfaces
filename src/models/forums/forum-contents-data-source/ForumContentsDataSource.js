import PagedDataSource from '../../../data-sources/PagedDataSource';
import PagedBatch from '../../../data-sources/data-types/Page';

export default class ForumContentsDataSource extends PagedDataSource {
	async requestPage (pageID, params) {
		const forum = this.parent;
		const batchSize = params.batchSize || 10;

		const requestParams = {
			...params,
			batchStart: pageID * batchSize,
			batchSize
		};

		const contents = await forum.getContents(requestParams);

		return new PagedBatch(this.service, this.parent, {
			PageSize: requestParams.batchSize,
			...contents
		});
	}
}
