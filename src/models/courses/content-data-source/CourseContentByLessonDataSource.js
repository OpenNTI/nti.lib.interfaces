import PagedDataSource from '../../../data-sources/PagedDataSource';
import PagedBatch from '../../../data-sources/data-types/Page';


export default class CourseContentByLessonDataSource extends PagedDataSource {
	async loadOutline () {
		const {parent, loadedOutline} = this;

		if (loadedOutline) { return loadedOutline; }

		const outline = await parent.getOutline();
		const flattened = outline.getFlattenedList();

		this.loadedOutline = flattened.filter(node => node.hasLink('overview-content'));

		return this.loadedOutline;
	}


	async requestPage (pageID, params) {
		const outline = await this.loadOutline();
		const total = outline.length;
		const node = outline[pageID - 1];

		if (!node) {
			throw new Error('Page Not Found');
		}

		const contents = await node.getContent({decorateProgress: false});

		return new PagedBatch(this.service, this.parent, {Items: [contents], TotalItemCount: total, PageSize: 1});
	}
}
