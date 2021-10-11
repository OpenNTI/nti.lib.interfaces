const ContentPackageMimeType =
	'application/vnd.nextthought.renderablecontentpackage';

export default {
	handles: [ContentPackageMimeType],

	removeItemFrom(item, container) {
		return container.getContent().then(content => {
			return container.deleteLink('RemoveRefs', {
				target: item.NTIID,
			});
		});
	},
};
