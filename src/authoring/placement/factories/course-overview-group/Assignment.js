import OrderedContents from '../../../ordered-contents';

const AssignmentMimeType = 'application/vnd.nextthought.assessment.assignment';
const RefMimeType = 'application/vnd.nextthought.assignmentref';

function getDataForItem (item) {
	return {
		MimeType: RefMimeType,
		label: item.title,
		title: item.title,
		'Target-NTIID': item.NTIID
	};
}

export default {
	handles: AssignmentMimeType,

	placeItemIn (item, container) {
		// const orderedContents = new OrderedContents(container);
		// const data = getDataForItem(item);

		// return orderedContents.append(data);

		return new Promise((fulfill, reject) => {
			setTimeout(() => {
				fulfill();
			}, 3000);
		});
	},


	removeItemFrom (item, container) {
		debugger;
	}
};
