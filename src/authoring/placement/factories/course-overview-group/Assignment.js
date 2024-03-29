import OrderedContents from '../../../ordered-contents/index.js';

const AssignmentMimeType = 'application/vnd.nextthought.assessment.assignment';
const TimedAssignmentMimeType =
	'application/vnd.nextthought.assessment.timedassignment';
const DiscussionAssignmentType =
	'application/vnd.nextthought.assessment.discussionassignment';

const RefMimeType = 'application/vnd.nextthought.assignmentref';

function getDataForItem(item) {
	return {
		MimeType: RefMimeType,
		label: item.title,
		title: item.title,
		'Target-NTIID': item.NTIID,
	};
}

export default {
	handles: [
		AssignmentMimeType,
		TimedAssignmentMimeType,
		DiscussionAssignmentType,
	],

	placeItemIn(item, container) {
		const orderedContents = new OrderedContents(container);
		const data = getDataForItem(item);

		return orderedContents.append(data);
	},
};
