const AssignmentMimeType = 'application/vnd.nextthought.assessment.assignment';
const refresh = (item) => item.refresh().then(() => item.onChange());

export default {
	handles: AssignmentMimeType,

	removeItemFrom (item, container) {
		return container.requestLink('RemoveRefs', 'delete', void 0, {target: item.NTIID})
			.then(() => refresh(item));
	}
};
