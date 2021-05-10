import { Service } from '../../../constants.js';
import DiscussionInterface from '../../../mixins/DiscussionInterface.js';

const DiscussionType = 'application/vnd.nextthought.note';

export default Target =>
	class Pages extends Target {
		async addDiscussion(data) {
			const service = this[Service];

			const { pagesURL, ...discussionData } = data;
			const href =
				pagesURL || service.getCollectionFor(DiscussionType)?.href;

			if (!href) {
				throw new Error('No collection to post to.');
			}

			const payload = DiscussionInterface.getPayload({
				MimeType: DiscussionType,
				...discussionData,
			});

			const newDiscussion = await service.postParseResponse(
				href,
				payload
			);

			this.insertNewDiscussion?.(newDiscussion);

			return newDiscussion;
		}
	};
