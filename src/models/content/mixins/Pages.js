import { Service } from '../../../constants';
import DiscussionInterface from '../../../mixins/DiscussionInterface';

const DiscussionType = 'application/vnd.nextthought.note';

export default {
	async addDiscussion (data) {
		const service = this[Service];

		const {pagesURL, ...discussionData} = data;
		const href = pagesURL || service.getCollectionFor(DiscussionType)?.href;

		if (!href) {
			throw new Error('No collection to post to.');
		}

		const payload = DiscussionInterface.getPayload({
			MimeType: DiscussionType,
			...discussionData
		});

		const newDiscussion = await service.postParseResponse(href, payload);

		this.insertNewDiscussion?.(newDiscussion);

		return newDiscussion;
	}
};