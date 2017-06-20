const ContentPackageMimeType = 'application/vnd.nextthought.renderablecontentpackage';

export default {
	handles: [ContentPackageMimeType],

	removeItemFrom (item, container) {
		return container.requestLink('RemoveRefs', 'delete', void 0, {target: item.NTIID});
	}
};
