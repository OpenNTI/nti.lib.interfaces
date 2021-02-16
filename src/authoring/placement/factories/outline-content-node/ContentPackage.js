const ContentPackageMimeType =
	'application/vnd.nextthought.renderablecontentpackage';

export default {
	handles: [ContentPackageMimeType],

	removeItemFrom(item, container) {
		return container.getContent().then(content => {
			return content.requestLink('RemoveRefs', 'delete', void 0, {
				target: item.NTIID,
			});
		});
	},
};
