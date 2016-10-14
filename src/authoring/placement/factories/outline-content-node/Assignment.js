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

	removeItemFrom (item, container) {
		debugger;

		return new Promise((fulfill, reject) => {
			setTimeout(() => {
				reject('Error Message');
			}, 3000);
		});
	}
};
