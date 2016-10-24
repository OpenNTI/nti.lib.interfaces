import OrderedContents from '../../../ordered-contents';

const AssignmentMimeType = 'application/vnd.nextthought.assessment.assignment';
const RefMimeType = 'application/vnd.nextthought.assignmentref';

const refresh = (item) => item.refresh().then(() => item.onChange());

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
		const orderedContents = new OrderedContents(container);
		const data = getDataForItem(item);

		return orderedContents.append(data)
			.then(() => refresh(item));
	}
};
