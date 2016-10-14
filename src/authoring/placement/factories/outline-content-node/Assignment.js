const AssignmentMimeType = 'application/vnd.nextthought.assessment.assignment';

export default {
	handles: AssignmentMimeType,

	removeItemFrom (item, container) {
		return container.getContent()
			.then((content) => {
				return content.requestLink('RemoveRefs', 'delete', void 0, {target: item.NTIID});
			});
	}
};
