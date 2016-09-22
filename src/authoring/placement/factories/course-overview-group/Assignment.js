const AssignmentMimeType = 'application/vnd.nextthought.assessment.assignment';

export default {
	type: AssignmentMimeType,

	placeItemIn (item, container, scope) {
		debugger;

		return new Promise((reject) => {
			reject('Error Message');
		});
	}
};
